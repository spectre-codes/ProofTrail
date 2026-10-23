import type { RawExtractedItem, ChecklistItem } from './verifyQuote.ts';
import { verifyItems } from './verifyQuote.ts';

export const SAMPLE_BRIEF_TEXT = `BUILD WITH AI: BASICS HACKATHON — OFFICIAL BRIEF & GUIDELINES

Welcome builders! The goal of this challenge is to build a proof-of-concept AI application that solves a real workflow problem using plan-first agentic development.

REQUIRED DELIVERABLES:
1. Public GitHub Repository: All teams must provide a public GitHub repository link containing your source code and documentation.
2. Short Demo Video: You must submit a 2-minute demo video showing the running proof of concept and explaining how you planned it.
3. Architecture Overview: Include an app map or README section explaining the core journey and stack choices.

CRITICAL RULES & CONSTRAINTS:
- No pre-built proprietary software: All core code must be created during the official hackathon window.
- AI Model Integration: The solution must integrate an AI model for intelligence and structured data extraction.
- Team Size: Teams may consist of 1 to 4 individuals. Single-builder projects are welcomed.

SUBMISSION DEADLINE:
- Final deliverables must be submitted by Friday before midnight through the Devpost portal. Late submissions cannot be accepted under any circumstances.

Good luck, and remember to keep your proof of concept laser-focused on the core user journey!`;

/**
 * Raw candidate extractions for offline sandbox / demo mode.
 * NOTE: These are NOT pre-computed statuses. They are passed directly
 * into `verifyItems()` at runtime against the source text to demonstrate:
 * 1) Verified items (found verbatim in source)
 * 2) Ambiguous items (found in source, but flagged with missing detail)
 * 3) Hallucinated items (deliberately fabricated quote that fails verification)
 */
export const RAW_SAMPLE_CANDIDATE_ITEMS: RawExtractedItem[] = [
  {
    id: 'sample-cand-1',
    title: 'Provide public GitHub repository with source code & docs',
    category: 'deliverable',
    verbatimQuote: 'All teams must provide a public GitHub repository link containing your source code and documentation.',
    isAmbiguous: false,
  },
  {
    id: 'sample-cand-2',
    title: 'Submit 2-minute demo video showing running PoC',
    category: 'deliverable',
    verbatimQuote: 'You must submit a 2-minute demo video showing the running proof of concept and explaining how you planned it.',
    isAmbiguous: false,
  },
  {
    id: 'sample-cand-3',
    title: 'Include architecture overview/app map in README',
    category: 'deliverable',
    verbatimQuote: 'Include an app map or README section explaining the core journey and stack choices.',
    isAmbiguous: false,
  },
  {
    id: 'sample-cand-4',
    title: 'Submit final deliverables by Friday before midnight',
    category: 'deadline',
    verbatimQuote: 'Final deliverables must be submitted by Friday before midnight through the Devpost portal.',
    isAmbiguous: true,
    ambiguityReason: 'Critical Ambiguity: No calendar date or timezone specified for "Friday before midnight". Disqualification risk across international time zones.',
  },
  {
    id: 'sample-cand-5',
    title: 'Build all core code during hackathon window',
    category: 'rule',
    verbatimQuote: 'All core code must be created during the official hackathon window.',
    isAmbiguous: false,
  },
  {
    id: 'sample-cand-6',
    title: 'Form team of 1 to 4 members',
    category: 'rule',
    verbatimQuote: 'Teams may consist of 1 to 4 individuals. Single-builder projects are welcomed.',
    isAmbiguous: false,
  },
  {
    id: 'sample-cand-7',
    title: 'Integrate AI model for structured extraction',
    category: 'rule',
    verbatimQuote: 'The solution must integrate an AI model for intelligence and structured data extraction.',
    isAmbiguous: true,
    ambiguityReason: 'Unspecified Scope: Model type, provider restrictions, and local-vs-cloud hosting rules are left unspecified.',
  },
  {
    id: 'sample-cand-8',
    title: 'Submit printed team affidavit by physical mail',
    category: 'rule',
    verbatimQuote: 'All teams must mail a physical notarized affidavit to headquarters within 24 hours of registration.',
    isAmbiguous: false,
    ambiguityReason: 'Hallucination Guard: This requirement does not exist anywhere in the source document.',
  },
];

/**
 * Executes runtime verification on sample candidates against the provided or default brief text.
 */
export function getRuntimeVerifiedSampleItems(sourceText: string = SAMPLE_BRIEF_TEXT): ChecklistItem[] {
  return verifyItems(sourceText, RAW_SAMPLE_CANDIDATE_ITEMS);
}

// Retained for backward-compatibility if imported elsewhere
export const PRECOMPUTED_SAMPLE_ITEMS: ChecklistItem[] = getRuntimeVerifiedSampleItems(SAMPLE_BRIEF_TEXT);
