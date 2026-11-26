import assert from 'node:assert/strict';
import test from 'node:test';
import { serializeJsonLd } from '../src/lib/serializeJsonLd';

test('escapes script-closing characters while preserving JSON data', () => {
  const input = { name: '</script><script>alert(1)</script>' };
  const serialized = serializeJsonLd(input);

  assert.equal(serialized.includes('<'), false);
  assert.deepEqual(JSON.parse(serialized), input);
});
