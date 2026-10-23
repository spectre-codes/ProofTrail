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
  matchedText?: string;
  occurrenceCount: number;
}

/**
 * Normalizes text for clean fallback substring search:
 * - Converts typographic smart quotes to ASCII equivalents
 * - Normalizes various dashes to standard hyphen
 * - Collapses repeated whitespace & newlines to a single space
 * - Trims leading & trailing whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Constructs a flexible RegExp matching the quote against the original source text,
 * accounting for whitespace variations (newlines/tabs), smart quotes, and dashes,
 * without mutating or misaligning original character offsets.
 */
function buildFlexibleRegex(quote: string, flags: string = 'gi'): RegExp | null {
  const trimmed = quote.trim();
  if (!trimmed) return null;

  const words = trimmed.split(/\s+/);
  const escapedWords = words.map((w) =>
    w
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/['"\u2018\u2019\u201C\u201D]/g, `['"\\u2018\\u2019\\u201C\\u201D]`)
      .replace(/[-—–\u2010\u2013\u2014]/g, `[-—–\\u2010\\u2013\\u2014]`)
  );

  const pattern = escapedWords.join('\\s+');
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

/**
 * Deterministically verifies an extracted quote against the source text.
 * Calculates exact original-string start/end boundaries and occurrence counts.
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
  matchedText?: string;
  occurrenceCount: number;
  ambiguityReason?: string;
} {
  if (!sourceText || !quote || !quote.trim()) {
    return {
      status: 'UNVERIFIED',
      occurrenceCount: 0,
      ambiguityReason: 'No source quote provided by extraction model',
    };
  }

  // 1. Literal Exact Match Check
  const literalOccurrences: number[] = [];
  let pos = sourceText.indexOf(quote);
  while (pos !== -1) {
    literalOccurrences.push(pos);
    pos = sourceText.indexOf(quote, pos + 1);
  }

  if (literalOccurrences.length > 0) {
    const startIndex = literalOccurrences[0];
    const endIndex = startIndex + quote.length;
    return {
      status: isAmbiguous ? 'AMBIGUOUS' : 'VERIFIED',
      matchStartIndex: startIndex,
      matchEndIndex: endIndex,
      matchedText: sourceText.slice(startIndex, endIndex),
      occurrenceCount: literalOccurrences.length,
      ambiguityReason: isAmbiguous ? ambiguityReason : undefined,
    };
  }

  // 2. Flexible Regex Match (Maps directly to original source text characters)
  const regex = buildFlexibleRegex(quote, 'gi');
  if (regex) {
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sourceText)) !== null) {
      matches.push(match);
      if (match.index === regex.lastIndex) regex.lastIndex++; // Avoid zero-width infinite loops
    }

    if (matches.length > 0) {
      const first = matches[0];
      const startIndex = first.index;
      const endIndex = startIndex + first[0].length;
      return {
        status: isAmbiguous ? 'AMBIGUOUS' : 'VERIFIED',
        matchStartIndex: startIndex,
        matchEndIndex: endIndex,
        matchedText: sourceText.slice(startIndex, endIndex),
        occurrenceCount: matches.length,
        ambiguityReason: isAmbiguous ? ambiguityReason : undefined,
      };
    }
  }

  // 3. Fallback Normalized Substring Check (Hallucination Guard)
  const normSource = normalizeText(sourceText).toLowerCase();
  const normQuote = normalizeText(quote).toLowerCase();

  if (normQuote && normSource.includes(normQuote)) {
    // Quote matched under normalization, but could not map cleanly via regex
    return {
      status: isAmbiguous ? 'AMBIGUOUS' : 'VERIFIED',
      occurrenceCount: 1,
      ambiguityReason: isAmbiguous ? ambiguityReason : undefined,
    };
  }

  // Not found in source text: flagged as unverified (hallucination caught)
  return {
    status: 'UNVERIFIED',
    occurrenceCount: 0,
    ambiguityReason: 'Quote could not be deterministically matched in source text (no verbatim evidence found)',
  };
}

/**
 * Verifies an array of extracted candidate items against source text.
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
      id: item.id || `audit-item-${index + 1}-${Date.now()}`,
      title: item.title,
      category: item.category,
      verbatimQuote: item.verbatimQuote,
      isAmbiguous: item.isAmbiguous,
      ambiguityReason: verification.ambiguityReason || item.ambiguityReason,
      status: verification.status,
      completed: false,
      matchStartIndex: verification.matchStartIndex,
      matchEndIndex: verification.matchEndIndex,
      matchedText: verification.matchedText,
      occurrenceCount: verification.occurrenceCount,
    };
  });
}
