import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getRuntimeVerifiedSampleItems, SAMPLE_BRIEF_TEXT } from '../sampleData.ts';
import type { ChecklistItem } from '../verifyQuote.ts';

describe('Progress tracking and filtering logic mechanical verification', () => {
  it('correctly calculates progress percentage on task completion', () => {
    const items: ChecklistItem[] = getRuntimeVerifiedSampleItems(SAMPLE_BRIEF_TEXT);
    const total = items.length;
    assert.strictEqual(total, 8);

    // Initial state: 0 completed
    let completed = items.filter((i) => i.completed).length;
    let progress = Math.round((completed / total) * 100);
    assert.strictEqual(progress, 0);

    // Complete 4 items
    items[0].completed = true;
    items[1].completed = true;
    items[2].completed = true;
    items[3].completed = true;

    completed = items.filter((i) => i.completed).length;
    progress = Math.round((completed / total) * 100);
    assert.strictEqual(completed, 4);
    assert.strictEqual(progress, 50); // 4/8 = 50%
  });

  it('correctly filters by category', () => {
    const items = getRuntimeVerifiedSampleItems(SAMPLE_BRIEF_TEXT);

    const deliverables = items.filter((i) => i.category === 'deliverable');
    const deadlines = items.filter((i) => i.category === 'deadline');
    const rules = items.filter((i) => i.category === 'rule');

    assert.strictEqual(deliverables.length, 3);
    assert.strictEqual(deadlines.length, 1);
    assert.strictEqual(rules.length, 4);
  });

  it('correctly filters by verification status (VERIFIED, AMBIGUOUS, UNVERIFIED)', () => {
    const items = getRuntimeVerifiedSampleItems(SAMPLE_BRIEF_TEXT);

    const verified = items.filter((i) => i.status === 'VERIFIED');
    const ambiguous = items.filter((i) => i.status === 'AMBIGUOUS');
    const unverified = items.filter((i) => i.status === 'UNVERIFIED');

    assert.strictEqual(verified.length, 5);
    assert.strictEqual(ambiguous.length, 2);
    assert.strictEqual(unverified.length, 1);
    assert.strictEqual(unverified[0].status, 'UNVERIFIED');
    assert.strictEqual(unverified[0].occurrenceCount, 0);
  });

  it('validates session storage serialization format', () => {
    const items = getRuntimeVerifiedSampleItems(SAMPLE_BRIEF_TEXT);
    const session = {
      sourceText: 'test brief',
      items,
      isSampleMode: true,
      lastUpdated: 1729700000000,
    };

    const serialized = JSON.stringify(session);
    const parsed = JSON.parse(serialized);

    assert.strictEqual(parsed.sourceText, 'test brief');
    assert.strictEqual(parsed.items.length, 8);
    assert.strictEqual(parsed.isSampleMode, true);
  });
});
