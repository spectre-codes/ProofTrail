import { verifyItems, type RawExtractedItem } from '../../../lib/verifyQuote.ts';
import { RAW_SAMPLE_CANDIDATE_ITEMS, SAMPLE_BRIEF_TEXT } from '../../../lib/sampleData.ts';

const MAX_SOURCE_CHARS = 30000;

const EXTRACTION_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: {
        type: 'STRING',
        description: 'Actionable summary of the deliverable, deadline, or rule',
      },
      category: {
        type: 'STRING',
        enum: ['deliverable', 'deadline', 'rule'],
        description: 'Type of requirement',
      },
      verbatimQuote: {
        type: 'STRING',
        description: 'EXACT verbatim sentence or clause copied directly from the source text supporting this item. Do NOT paraphrase.',
      },
      isAmbiguous: {
        type: 'BOOLEAN',
        description: 'True if key information is missing (e.g. date without timezone, vague format, or unspecified constraint)',
      },
      ambiguityReason: {
        type: 'STRING',
        description: 'Explanation of why this requirement is ambiguous or risky, if isAmbiguous is true',
      },
    },
    required: ['title', 'category', 'verbatimQuote', 'isAmbiguous'],
  },
};

const SYSTEM_INSTRUCTION = `You are ProofTrail, a forensic document requirements auditor.
Your job is to extract all concrete deliverables, deadlines, and critical rules/constraints from the provided project brief or instructions.

CRITICAL EVIDENCE RULES:
1. "verbatimQuote" MUST be an exact, character-for-character substring copied directly from the provided text. Never paraphrase, alter, synthesize, or combine words in verbatimQuote.
2. If a deadline or rule is vague, missing a timezone, missing a specific calendar date (e.g. "submit by Friday"), or has an unspecified file/submission format, set "isAmbiguous" to true and provide a concise "ambiguityReason".
3. Return only valid JSON conforming strictly to the requested schema.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sourceText = typeof body.text === 'string' ? body.text.trim() : '';

    if (!sourceText) {
      return Response.json(
        { error: 'Source text cannot be empty. Please paste your brief or click "Load Sample Brief".' },
        { status: 400 }
      );
    }

    if (sourceText.length > MAX_SOURCE_CHARS) {
      return Response.json(
        { error: `Source text exceeds maximum limit of ${MAX_SOURCE_CHARS.toLocaleString()} characters (current: ${sourceText.length.toLocaleString()} characters). Please shorten the brief.` },
        { status: 413 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // OFFLINE VERIFICATION SANDBOX / DEMO MODE:
    // If no API key is configured, execute RUNTIME deterministic verification
    // on candidate items against the source text so the verification engine is genuinely tested.
    if (!apiKey) {
      const isSampleBrief =
        sourceText.includes('BUILD WITH AI: BASICS HACKATHON') ||
        Math.abs(sourceText.length - SAMPLE_BRIEF_TEXT.trim().length) < 50;

      if (isSampleBrief) {
        // Run verifyItems at runtime against the actual submitted text!
        const verifiedItems = verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);

        return Response.json({
          items: verifiedItems,
          isSampleMode: true,
          modelUsed: 'offline-verification-sandbox',
          message: 'Offline Verification Sandbox: Evaluated candidates at runtime with lib/verifyQuote.ts.',
        });
      }

      // If user provided arbitrary custom text without an API key, run verification on sample candidates
      // against their text (which demonstrates hallucination catching if text doesn't contain the quotes)
      const verifiedItems = verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);

      return Response.json({
        items: verifiedItems,
        isSampleMode: true,
        modelUsed: 'offline-verification-sandbox',
        message: 'No GEMINI_API_KEY configured in .env.local. Running sample audit candidates through the verification engine against your text.',
      });
    }

    // LIVE GEMINI 2.5 FLASH EXTRACTION + RUNTIME VERIFICATION
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}\n\n--- SOURCE TEXT ---\n${sourceText}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: EXTRACTION_SCHEMA as any,
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '[]';
      const rawItems: RawExtractedItem[] = JSON.parse(responseText);

      // DETERMINISTIC RUNTIME VERIFICATION:
      // Verify every extracted candidate quote against the original source text
      const verifiedItems = verifyItems(sourceText, rawItems);

      return Response.json({
        items: verifiedItems,
        isSampleMode: false,
        modelUsed: 'gemini-2.5-flash',
      });
    } catch (apiError: any) {
      console.error('Gemini API call error:', apiError);

      // Graceful fallback for sample brief during demo presentations if API fails
      if (sourceText.includes('BUILD WITH AI: BASICS HACKATHON')) {
        const verifiedItems = verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);
        return Response.json({
          items: verifiedItems,
          isSampleMode: true,
          modelUsed: 'fallback-verification-sandbox',
          error: apiError?.message || 'Gemini API call failed; loaded offline verification candidates.',
        });
      }

      return Response.json(
        {
          error: `Gemini API error: ${apiError?.message || 'Failed to analyze text'}. Verify GEMINI_API_KEY in .env.local.`,
          isSampleMode: false,
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error('Server error in /api/analyze:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
