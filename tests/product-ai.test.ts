import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:5432/product_ai_test';
process.env.JWT_SECRET = 'product-ai-test-secret-with-at-least-32-characters';

const {
  createPrompt,
  getImageModelCandidates,
  isGeneralPurposeFlashModel,
  requestProductDetails,
} = await import('../server-api/product-ai.js');

const originalFetch = globalThis.fetch;
const requestBody = JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] });

function imageRejected() {
  return new Response(JSON.stringify({
    error: { message: 'Image input modality is not enabled for this model.' },
  }), { status: 400 });
}

function success() {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: '{"name":"Test product"}' }] } }],
  }), { status: 200 });
}

test('requests detailed, business-minded descriptions without invented claims', () => {
  const prompt = createPrompt();
  assert.match(prompt, /120 to 180 words/);
  assert.match(prompt, /two short paragraphs separated by a blank line/);
  assert.match(prompt, /customer value/);
  assert.match(prompt, /Use only text and details that are clearly visible/);
  assert.match(prompt, /Never invent a brand, size, origin, ingredient/);
});

test('uses the current image-capable Flash-Lite model by default', () => {
  const candidates = getImageModelCandidates();
  assert.equal(candidates[0], 'gemini-3.5-flash-lite');
  assert.ok(candidates.includes('gemini-3.1-flash-lite'));
  assert.ok(!candidates.includes('gemini-2.0-flash-lite'));
});

test('respects an explicitly configured model and excludes specialized media models', () => {
  assert.equal(getImageModelCandidates('models/gemini-3.8-flash')[0], 'gemini-3.8-flash');
  assert.equal(isGeneralPurposeFlashModel('gemini-3.1-flash-lite'), true);
  assert.equal(isGeneralPurposeFlashModel('gemini-3.1-flash-lite-image'), false);
  assert.equal(isGeneralPurposeFlashModel('gemini-3.8-flash-tts'), false);
  assert.ok(getImageModelCandidates(undefined, ['gemini-4.1-flash']).includes('gemini-4.1-flash'));
});

test('falls back when Gemini rejects image input', async t => {
  const calls: string[] = [];
  globalThis.fetch = async input => {
    const url = input instanceof Request ? input.url : String(input);
    calls.push(url);
    if (url.endsWith('/v1beta/models')) {
      return new Response(JSON.stringify({
        models: [
          { name: 'models/gemini-3.1-flash-lite', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-3.1-flash-image', supportedGenerationMethods: ['generateContent'] },
        ],
      }), { status: 200 });
    }
    if (url.includes('/gemini-3.5-flash-lite:generateContent')) return imageRejected();
    return success();
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await requestProductDetails('test-key-default-fallback', requestBody);
  assert.equal(result.response.status, 200);
  assert.equal(result.model, 'gemini-3.1-flash-lite');
  assert.equal(result.noImageCapableModel, false);
  assert.ok(calls[0].includes('/gemini-3.5-flash-lite:generateContent'));
  assert.ok(calls.some(call => call.includes('/gemini-3.1-flash-lite:generateContent')));
});

test('does not hide quota errors behind model fallback', async t => {
  const calls: string[] = [];
  globalThis.fetch = async input => {
    const url = input instanceof Request ? input.url : String(input);
    calls.push(url);
    return new Response(JSON.stringify({ error: { message: 'Quota exceeded' } }), { status: 429 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await requestProductDetails('test-key-quota', requestBody, 'gemini-3.8-flash');
  assert.equal(result.response.status, 429);
  assert.equal(result.noImageCapableModel, false);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes('/gemini-3.8-flash:generateContent'));
});

test('reports when every candidate rejects image input', async t => {
  globalThis.fetch = async input => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.endsWith('/v1beta/models')) {
      return new Response(JSON.stringify({ models: [] }), { status: 200 });
    }
    return imageRejected();
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await requestProductDetails('test-key-no-image', requestBody);
  assert.equal(result.response.status, 400);
  assert.equal(result.noImageCapableModel, true);
});
