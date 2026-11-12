import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the BP wizard posts its serialized payload as JSON', async () => {
  const source = await readFile(new URL('../src/app/protected/new/etat-projet/page.tsx', import.meta.url), 'utf8');

  assert.match(source, /fetch\("\/api\/bp",\s*\{[\s\S]*?method:\s*"POST"/);
  assert.match(source, /headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/);
  assert.match(source, /body:\s*JSON\.stringify\(newBp\)/);
});
