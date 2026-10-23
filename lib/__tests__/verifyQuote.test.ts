import { describe, it } from 'node:test';
import assert from 'node:assert';
import { verifyQuote, verifyItems, normalizeText } from '../verifyQuote.ts';

describe('verifyQuote deterministic verification engine', () => {
  const sourceText = `Welcome to the AI Basics Hackathon!
All submissions must include a 2-minute demo video and a public GitHub repository.
Deliverables must be submitted by Friday before 11:59 PM.
Late submissions will be disqualified immediately.
Remember: All submissions must include a 2-minute demo video!`;

  it('normalizes smart quotes, dashes, and collapsing whitespace', () => {
    const input = '“Smart quotes” — with   em-dash  and\nmultiple \t spaces';
    const normalized = normalizeText(input);
    assert.strictEqual(normalized, '"Smart quotes" - with em-dash and multiple spaces');
  });

  it('verifies exact literal matches and maps accurate original indices', () => {
    const quote = 'All submissions must include a 2-minute demo video';
    const result = verifyQuote(sourceText, quote, false);
    assert.strictEqual(result.status, 'VERIFIED');
    assert.strictEqual(result.occurrenceCount, 2);
    assert.ok(result.matchStartIndex !== undefined && result.matchEndIndex !== undefined);
    assert.strictEqual(
      sourceText.slice(result.matchStartIndex, result.matchEndIndex),
      quote
    );
  });

  it('maps normalized quotes with linebreaks/whitespace accurately to original source slice', () => {
    const multiLineSource = `Project Instructions:\nTeams must provide\n\n  a public GitHub repository\nlink with code.`;
    const quote = `Teams must provide a public GitHub repository link with code.`;
    const result = verifyQuote(multiLineSource, quote, false);
    assert.strictEqual(result.status, 'VERIFIED');
    assert.ok(result.matchStartIndex !== undefined && result.matchEndIndex !== undefined);
    // The slice from the original text should contain the exact words despite original newlines
    const originalSlice = multiLineSource.slice(result.matchStartIndex, result.matchEndIndex);
    assert.ok(originalSlice.includes('Teams must provide'));
    assert.ok(originalSlice.includes('link with code.'));
  });

  it('marks existing quote as AMBIGUOUS when isAmbiguous is true', () => {
    const quote = 'Deliverables must be submitted by Friday';
    const result = verifyQuote(
      sourceText,
      quote,
      true,
      'No timezone specified for Friday deadline'
    );
    assert.strictEqual(result.status, 'AMBIGUOUS');
    assert.strictEqual(
      result.ambiguityReason,
      'No timezone specified for Friday deadline'
    );
    assert.strictEqual(result.occurrenceCount, 1);
  });

  it('flags hallucinated quotes as UNVERIFIED (hallucination caught)', () => {
    const hallucinatedQuote = 'All teams must submit a 10-page printed notarized affidavit';
    const result = verifyQuote(sourceText, hallucinatedQuote, false);
    assert.strictEqual(result.status, 'UNVERIFIED');
    assert.strictEqual(result.occurrenceCount, 0);
    assert.ok(result.ambiguityReason?.includes('could not be deterministically matched'));
  });

  it('flags empty quotes as UNVERIFIED', () => {
    const result = verifyQuote(sourceText, '   ', false);
    assert.strictEqual(result.status, 'UNVERIFIED');
    assert.strictEqual(result.occurrenceCount, 0);
  });

  it('verifies an array of items via verifyItems with all 3 states', () => {
    const items = [
      {
        title: 'Submit demo video',
        category: 'deliverable' as const,
        verbatimQuote: 'All submissions must include a 2-minute demo video',
        isAmbiguous: false,
      },
      {
        title: 'Submit by Friday',
        category: 'deadline' as const,
        verbatimQuote: 'Deliverables must be submitted by Friday',
        isAmbiguous: true,
        ambiguityReason: 'Missing timezone',
      },
      {
        title: 'Include pitch deck',
        category: 'deliverable' as const,
        verbatimQuote: 'Submit printed pitch deck to headquarters',
        isAmbiguous: false,
      },
    ];

    const verified = verifyItems(sourceText, items);
    assert.strictEqual(verified.length, 3);
    assert.strictEqual(verified[0].status, 'VERIFIED');
    assert.strictEqual(verified[0].occurrenceCount, 2);
    assert.strictEqual(verified[1].status, 'AMBIGUOUS');
    assert.strictEqual(verified[1].occurrenceCount, 1);
    assert.strictEqual(verified[2].status, 'UNVERIFIED');
    assert.strictEqual(verified[2].occurrenceCount, 0);
  });
});
