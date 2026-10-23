export type Category = 'deliverable' | 'deadline' | 'rule';
export type VerificationStatus = 'VERIFIED' | 'AMBIGUOUS' | 'UNVERIFIED';

export interface RawExtractedItem {
  id?: string;
  title: string;
  category: Category;
  verbatimQuote: string;
  isAmbiguous: boolean;
  ambiguityReason?: string;
}

export interface ChecklistItem extends RawExtractedItem {
  id: string;
  status: VerificationStatus;
  completed: boolean;
  matchStartIndex?: number;
  matchEndIndex?: number;
}

/**
 * Normalizes text for robust substring matching:
 * - Converts typographic / smart quotes to ASCII equivalents
 * - Collapses repeated whitespace & newlines to a single space
 * - Trims leading & trailing whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically verifies an extracted quote against the source text.
 * Returns verification status and character offsets if matched.
 */
export function verifyQuote(
  sourceText: string,
  quote: string,
  isAmbiguous: boolean = false,
  ambiguityReason?: string
): {
  status: VerificationStatus;
  matchStartIndex?: number;
  matchEndIndex?: number;
  ambiguityReason?: string;
} {
  if (!sourceText || !quote || !quote.trim()) {
    return {
      status: 'UNVERIFIED',
      ambiguityReason: 'No source quote provided by extraction model',
    };
  }

  // First try direct literal match
  const literalIndex = sourceText.indexOf(quote);
  if (literalIndex !== -1) {
    return {
      status: isAmbiguous ? 'AMBIGUOUS' : 'VERIFIED',
      matchStartIndex: literalIndex,
      matchEndIndex: literalIndex + quote.length,
      ambiguityReason: isAmbiguous ? ambiguityReason : undefined,
    };
  }

  // Second: try normalized matching (handling smart quotes & whitespace differences)
  const normSource = normalizeText(sourceText).toLowerCase();
  const normQuote = normalizeText(quote).toLowerCase();

  const normIndex = normSource.indexOf(normQuote);
  if (normIndex !== -1) {
    // Attempt approximate mapping back to original text or normalized boundaries
    return {
      status: isAmbiguous ? 'AMBIGUOUS' : 'VERIFIED',
      matchStartIndex: normIndex,
      matchEndIndex: normIndex + normQuote.length,
      ambiguityReason: isAmbiguous ? ambiguityReason : undefined,
    };
  }

  // Not found in source text: flagged as unverified (hallucination guard)
  return {
    status: 'UNVERIFIED',
    ambiguityReason: 'Quote could not be deterministically matched in source text',
  };
}

/**
 * Verifies an array of extracted items against source text.
 */
export function verifyItems(
  sourceText: string,
  items: RawExtractedItem[]
): ChecklistItem[] {
  return items.map((item, index) => {
    const verification = verifyQuote(
      sourceText,
      item.verbatimQuote,
      item.isAmbiguous,
      item.ambiguityReason
    );

    return {
      id: item.id || `item-${index + 1}-${Date.now()}`,
      title: item.title,
      category: item.category,
      verbatimQuote: item.verbatimQuote,
      isAmbiguous: item.isAmbiguous,
      ambiguityReason: verification.ambiguityReason || item.ambiguityReason,
      status: verification.status,
      completed: false,
      matchStartIndex: verification.matchStartIndex,
      matchEndIndex: verification.matchEndIndex,
    };
  });
}

