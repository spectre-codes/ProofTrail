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

// Helper to normalize collapsing whitespace and linebreaks for text comparison
const normalizeWhitespace = (str: string) => str.trim().replace(/\s+/g, ' ');

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
    // If no API key is configured, evaluate prepared sample candidates ONLY when the submitted text
    // matches the built-in sample brief (after trimming and normalizing whitespace).
    if (!apiKey) {
      const isSampleBrief =
        normalizeWhitespace(sourceText) === normalizeWhitespace(SAMPLE_BRIEF_TEXT);

      if (isSampleBrief) {
        // Run verifyItems at runtime against the submitted sample text
        const verifiedItems = verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);

        return Response.json({
          items: verifiedItems,
          isSampleMode: true,
          modelUsed: 'offline-verification-sandbox',
          message: 'Offline Verification Sandbox: Evaluated candidates at runtime with lib/verifyQuote.ts.',
        });
      }

      // If user provided arbitrary custom text without an API key, return a clean 503 response
      // explaining that the offline sandbox only evaluates the built-in Sample Brief fixture.
      return Response.json(
        {
          error: 'Offline Verification Sandbox only evaluates the built-in Sample Brief fixture. Analyzing custom documents requires a GEMINI_API_KEY configured in .env.local. Click "Load Sample Brief" to test the offline verification engine.',
          isSampleMode: true,
        },
        { status: 503 }
      );
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

      // Graceful fallback for sample brief during demo presentations if live API fails
      if (normalizeWhitespace(sourceText) === normalizeWhitespace(SAMPLE_BRIEF_TEXT)) {
        const verifiedItems = verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);
        return Response.json({
          items: verifiedItems,
          isSampleMode: true,
          modelUsed: 'fallback-verification-sandbox',
          message: 'Gemini API call failed; loaded offline verification candidates.',
        });
      }

      return Response.json(
        {
          error: 'Gemini API analysis failed. Please verify your GEMINI_API_KEY in .env.local and try again.',
          isSampleMode: false,
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error('Server error in /api/analyze:', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
