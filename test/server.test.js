import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handle, hubUrls } from '../src/server.js';

test('only http(s) *_URL variables reach the page', () => {
  assert.deepEqual(hubUrls({ TEAM_URL: 'https://team.example', SECRET: 'x', BAD_URL: 'javascript:alert(1)', PORT: '3000' }), { TEAM_URL: 'https://team.example' });
});

test('serves the page, config and health', async () => {
  process.env.TEAM_URL = 'https://team.example';
  const server = createServer(handle);
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base + '/');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /منظومة وريف/);
    assert.match(await (await fetch(base + '/config.js')).text(), /team\.example/);
    assert.equal((await fetch(base + '/health')).status, 200);
    assert.equal((await fetch(base + '/apps.js')).headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal((await fetch(base + '/../src/server.js')).headers.get('content-type'), 'text/html; charset=utf-8');
  } finally {
    server.close();
  }
});
