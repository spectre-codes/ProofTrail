import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PRECOMPUTED_SAMPLE_ITEMS } from '../sampleData.ts';
import type { ChecklistItem } from '../verifyQuote.ts';

describe('Progress tracking and filtering logic mechanical verification', () => {
  it('correctly calculates progress percentage on task completion', () => {
    const items: ChecklistItem[] = [...PRECOMPUTED_SAMPLE_ITEMS];
    const total = items.length;
    assert.strictEqual(total, 7);

    // Initial state: 0 completed
    let completed = items.filter((i) => i.completed).length;
    let progress = Math.round((completed / total) * 100);
    assert.strictEqual(progress, 0);

    // Complete 3 items
    items[0].completed = true;
    items[1].completed = true;
    items[2].completed = true;

    completed = items.filter((i) => i.completed).length;
    progress = Math.round((completed / total) * 100);
    assert.strictEqual(completed, 3);
    assert.strictEqual(progress, 43); // 3/7 = 42.85% -> 43%
  });

  it('correctly filters by category', () => {
    const items = PRECOMPUTED_SAMPLE_ITEMS;

    const deliverables = items.filter((i) => i.category === 'deliverable');
    const deadlines = items.filter((i) => i.category === 'deadline');
    const rules = items.filter((i) => i.category === 'rule');

    assert.strictEqual(deliverables.length, 3);
    assert.strictEqual(deadlines.length, 1);
    assert.strictEqual(rules.length, 3);
  });

  it('correctly filters by verification status (VERIFIED vs AMBIGUOUS)', () => {
    const items = PRECOMPUTED_SAMPLE_ITEMS;

    const verified = items.filter((i) => i.status === 'VERIFIED');
    const ambiguous = items.filter((i) => i.status === 'AMBIGUOUS');

    assert.strictEqual(verified.length, 6);
    assert.strictEqual(ambiguous.length, 1);
    assert.strictEqual(ambiguous[0].isAmbiguous, true);
    assert.ok(ambiguous[0].ambiguityReason?.includes('timezone'));
  });

  it('validates session storage serialization format', () => {
    const session = {
      sourceText: 'test brief',
      items: PRECOMPUTED_SAMPLE_ITEMS,
      isSampleMode: true,
      lastUpdated: 1729700000000,
    };

    const serialized = JSON.stringify(session);
    const parsed = JSON.parse(serialized);

    assert.strictEqual(parsed.sourceText, 'test brief');
    assert.strictEqual(parsed.items.length, 7);
    assert.strictEqual(parsed.isSampleMode, true);
  });
});
