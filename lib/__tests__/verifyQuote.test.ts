import { describe, it } from 'node:test';
import assert from 'node:assert';
import { verifyQuote, verifyItems, normalizeText } from '../verifyQuote.ts';

describe('verifyQuote deterministic verification engine', () => {
  const sourceText = `Welcome to the AI Basics Hackathon!
All submissions must include a 2-minute demo video and a public GitHub repository.
Deliverables must be submitted by Friday before 11:59 PM.
Late submissions will be disqualified immediately.`;

  it('normalizes smart quotes and collapsing whitespace', () => {
    const input = '“Smart quotes”   and\nmultiple \t spaces';
    const normalized = normalizeText(input);
    assert.strictEqual(normalized, '"Smart quotes" and multiple spaces');
  });

  it('verifies exact literal matches as VERIFIED', () => {
    const quote = 'All submissions must include a 2-minute demo video';
    const result = verifyQuote(sourceText, quote, false);
    assert.strictEqual(result.status, 'VERIFIED');
    assert.ok(result.matchStartIndex !== undefined);
  });

  it('verifies normalized quotes (whitespace/case variations) as VERIFIED', () => {
    const quote = 'ALL SUBMISSIONS MUST INCLUDE A   2-MINUTE DEMO VIDEO';
    const result = verifyQuote(sourceText, quote, false);
    assert.strictEqual(result.status, 'VERIFIED');
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
  });

  it('flags hallucinated quotes as UNVERIFIED (anti-hallucination guard)', () => {
    const hallucinatedQuote = 'All teams must submit a 10-page PDF report';
    const result = verifyQuote(sourceText, hallucinatedQuote, false);
    assert.strictEqual(result.status, 'UNVERIFIED');
    assert.ok(result.ambiguityReason?.includes('could not be deterministically matched'));
  });

  it('flags empty quotes as UNVERIFIED', () => {
    const result = verifyQuote(sourceText, '   ', false);
    assert.strictEqual(result.status, 'UNVERIFIED');
  });

  it('verifies an array of items via verifyItems', () => {
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
        verbatimQuote: 'Submit pitch deck to organizers',
        isAmbiguous: false,
      },
    ];

    const verified = verifyItems(sourceText, items);
    assert.strictEqual(verified.length, 3);
    assert.strictEqual(verified[0].status, 'VERIFIED');
    assert.strictEqual(verified[0].completed, false);
    assert.strictEqual(verified[1].status, 'AMBIGUOUS');
    assert.strictEqual(verified[2].status, 'UNVERIFIED');
  });
});
