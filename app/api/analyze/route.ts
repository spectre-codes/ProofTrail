import { verifyItems, type RawExtractedItem } from '../../../lib/verifyQuote.ts';
import { PRECOMPUTED_SAMPLE_ITEMS, SAMPLE_BRIEF_TEXT } from '../../../lib/sampleData.ts';

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

const SYSTEM_INSTRUCTION = `You are ProofTrail, a meticulous requirements analysis engine.
Extract all concrete deliverables, deadlines, and critical rules/constraints from the provided project brief or instructions.

CRITICAL EVIDENCE RULES:
1. "verbatimQuote" MUST be an exact, character-for-character substring copied directly from the provided text. Never paraphrase, alter, or synthesize words in verbatimQuote.
2. If a deadline or rule is vague, missing a timezone, missing a specific calendar date (e.g. "submit by Friday"), or unspecified format, set "isAmbiguous" to true and provide a concise "ambiguityReason".
3. Return only valid JSON conforming strictly to the requested schema.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sourceText = body.text ? String(body.text).trim() : '';

    if (!sourceText) {
      return Response.json(
        { error: 'Source text cannot be empty' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // Zero-Config Demo Mode Fallback:
    // If no API key is configured, return pre-computed verified data for sample brief
    // or prompt for key if custom text was provided
    if (!apiKey) {
      console.log('No GEMINI_API_KEY detected. Running in Demo / Sample Mode.');
      
      const isSampleBrief = sourceText.includes('BUILD WITH AI: BASICS HACKATHON') ||
                            sourceText.length === SAMPLE_BRIEF_TEXT.trim().length;

      if (isSampleBrief) {
        return Response.json({
          items: PRECOMPUTED_SAMPLE_ITEMS,
          isSampleMode: true,
          modelUsed: 'offline-sample-evaluator',
          message: 'Running in Demo Mode (no API key configured). Pre-computed verification loaded.',
        });
      }

      return Response.json({
        items: [],
        isSampleMode: true,
        modelUsed: 'none',
        message: 'No GEMINI_API_KEY configured. Please add GEMINI_API_KEY to .env.local to analyze custom text, or click "Load Sample Brief" to test ProofTrail in Demo Mode.',
      });
    }

    // Call Gemini 2.5 Flash with structured output schema
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

      // DETERMINISTIC SERVER-SIDE VERIFICATION:
      const verifiedItems = verifyItems(sourceText, rawItems);

      return Response.json({
        items: verifiedItems,
        isSampleMode: false,
        modelUsed: 'gemini-2.5-flash',
      });
    } catch (apiError: any) {
      console.error('Gemini API call error:', apiError);
      
      if (sourceText.includes('BUILD WITH AI: BASICS HACKATHON')) {
        return Response.json({
          items: PRECOMPUTED_SAMPLE_ITEMS,
          isSampleMode: true,
          modelUsed: 'fallback-sample',
          error: apiError?.message || 'Gemini API call failed; loaded pre-computed demo results.',
        });
      }

      return Response.json(
        {
          error: `Gemini API error: ${apiError?.message || 'Failed to analyze text'}. Please check your API key in .env.local.`,
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
