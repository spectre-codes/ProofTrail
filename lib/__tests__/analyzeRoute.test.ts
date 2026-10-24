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

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('cannot be empty'));
  });

  it('returns 413 when text exceeds character limit', async () => {
    const hugeText = 'A'.repeat(30005);
    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: hugeText }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 413);
    const data = await res.json();
    assert.ok(data.error.includes('exceeds maximum limit'));
  });

  it('runs runtime verification on sample candidates exhibiting all 3 states (VERIFIED, AMBIGUOUS, UNVERIFIED)', async () => {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: SAMPLE_BRIEF_TEXT }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.isSampleMode, true);
    assert.ok(Array.isArray(data.items));
    assert.strictEqual(data.items.length, 8);

    // 1. Verify presence of VERIFIED items
    const verifiedItems = data.items.filter((i: any) => i.status === 'VERIFIED');
    assert.ok(verifiedItems.length >= 4, 'Should contain at least 4 VERIFIED items');
    assert.ok(verifiedItems[0].occurrenceCount >= 1);

    // 2. Verify presence of AMBIGUOUS items with reasons
    const ambiguousItems = data.items.filter((i: any) => i.status === 'AMBIGUOUS');
    assert.ok(ambiguousItems.length >= 1, 'Should contain at least 1 AMBIGUOUS item');
    assert.ok(ambiguousItems[0].ambiguityReason?.length > 0);

    // 3. Verify presence of UNVERIFIED hallucination-caught item
    const unverifiedItems = data.items.filter((i: any) => i.status === 'UNVERIFIED');
    assert.strictEqual(unverifiedItems.length, 1, 'Should contain exactly 1 UNVERIFIED item (hallucination caught)');
    assert.strictEqual(unverifiedItems[0].occurrenceCount, 0);
    assert.ok(unverifiedItems[0].title.includes('affidavit'));

    if (oldKey) process.env.GEMINI_API_KEY = oldKey;
  });

  it('returns clean 503 error when custom text is provided without an API key', async () => {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const customText = 'This is a custom client RFP for developing a mobile application.';
    const req = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: customText }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 503);
    const data = await res.json();
    assert.ok(data.error.includes('GEMINI_API_KEY'));
    assert.strictEqual(data.items, undefined);
    assert.strictEqual(data.isSampleMode, true);

    if (oldKey) process.env.GEMINI_API_KEY = oldKey;
  });
});
