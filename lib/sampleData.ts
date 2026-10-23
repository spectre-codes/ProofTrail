import type { ChecklistItem } from './verifyQuote.ts';

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

export const PRECOMPUTED_SAMPLE_ITEMS: ChecklistItem[] = [
  {
    id: 'sample-1',
    title: 'Provide public GitHub repository with source code & docs',
    category: 'deliverable',
    verbatimQuote: 'All teams must provide a public GitHub repository link containing your source code and documentation.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 312,
    matchEndIndex: 421,
  },
  {
    id: 'sample-2',
    title: 'Submit 2-minute demo video showing running PoC',
    category: 'deliverable',
    verbatimQuote: 'You must submit a 2-minute demo video showing the running proof of concept and explaining how you planned it.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 447,
    matchEndIndex: 557,
  },
  {
    id: 'sample-3',
    title: 'Include architecture overview/app map in README',
    category: 'deliverable',
    verbatimQuote: 'Include an app map or README section explaining the core journey and stack choices.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 585,
    matchEndIndex: 668,
  },
  {
    id: 'sample-4',
    title: 'Submit final deliverables by Friday before midnight',
    category: 'deadline',
    verbatimQuote: 'Final deliverables must be submitted by Friday before midnight through the Devpost portal.',
    isAmbiguous: true,
    ambiguityReason: 'Critical ambiguity: No calendar date or timezone specified for "Friday before midnight". Could lead to accidental disqualification across time zones.',
    status: 'AMBIGUOUS',
    completed: false,
    matchStartIndex: 1045,
    matchEndIndex: 1135,
  },
  {
    id: 'sample-5',
    title: 'Build all core code during hackathon window',
    category: 'rule',
    verbatimQuote: 'All core code must be created during the official hackathon window.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 745,
    matchEndIndex: 812,
  },
  {
    id: 'sample-6',
    title: 'Integrate AI model for structured extraction',
    category: 'rule',
    verbatimQuote: 'The solution must integrate an AI model for intelligence and structured data extraction.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 840,
    matchEndIndex: 929,
  },
  {
    id: 'sample-7',
    title: 'Form team of 1 to 4 members',
    category: 'rule',
    verbatimQuote: 'Teams may consist of 1 to 4 individuals. Single-builder projects are welcomed.',
    isAmbiguous: false,
    status: 'VERIFIED',
    completed: false,
    matchStartIndex: 944,
    matchEndIndex: 1023,
  },
];
