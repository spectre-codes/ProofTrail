import { describe, it } from 'node:test';
import assert from 'node:assert';
import { POST } from '../../app/api/analyze/route.ts';
import { SAMPLE_BRIEF_TEXT } from '../sampleData.ts';

describe('API Route /api/analyze mechanical verification', () => {
  it('returns 400 when text is empty', async () => {
    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('cannot be empty'));
  });

  it('returns pre-computed verified items in Demo/Sample Mode when API key is missing', async () => {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: SAMPLE_BRIEF_TEXT }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.isSampleMode, true);
    assert.ok(Array.isArray(data.items));
    assert.ok(data.items.length >= 5);

    // Verify presence of verified items
    const verifiedItem = data.items.find((i: any) => i.status === 'VERIFIED');
    assert.ok(verifiedItem, 'Should contain VERIFIED items');

    // Verify presence of ambiguous item with reason
    const ambiguousItem = data.items.find((i: any) => i.status === 'AMBIGUOUS');
    assert.ok(ambiguousItem, 'Should contain AMBIGUOUS item');
    assert.ok(ambiguousItem.ambiguityReason?.length > 0, 'Ambiguous item must have an ambiguity reason');

    if (oldKey) process.env.GEMINI_API_KEY = oldKey;
  });
});

