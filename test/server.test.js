import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handle, publicConfig } from '../src/server.js';

test('only safe settings reach the page', () => {
  assert.deepEqual(publicConfig({
    AZWO_URL: 'https://azwo.example', THEME_URL: 'javascript:alert(1)', SECRET_KEY: 'x', INTERNAL_API_URL: 'https://internal.example',
    CONTACT_EMAIL: 'hello@arso.sa', CONTACT_WHATSAPP: '+966 50 000 0000',
  }), { AZWO_URL: 'https://azwo.example', CONTACT_EMAIL: 'hello@arso.sa', CONTACT_WHATSAPP: '+966 50 000 0000' });
  assert.deepEqual(publicConfig({ CONTACT_EMAIL: 'not an email', CONTACT_WHATSAPP: '<script>' }), {});
});

test('serves the page, config, favicon and health', async () => {
  process.env.AZWO_URL = 'https://azwo.example';
  const server = createServer(handle);
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await (await fetch(base + '/')).text();
    assert.match(page, /أرسو/);
    assert.match(page, /أسرار Claude/);
    for (const [path, type] of [['/course.css', 'text/css'], ['/course-data.js', 'text/javascript'], ['/assets/logo-mesh.json', 'application/json'], ['/assets/gamila-regular.ttf', 'font/ttf']]) {
      const res = await fetch(base + path);
      assert.equal(res.status, 200, path);
      assert.match(res.headers.get('content-type'), new RegExp(type), path);
    }
    assert.match(await (await fetch(base + '/config.js')).text(), /window\.ARSO = .*azwo\.example/);
    assert.equal((await fetch(base + '/favicon.ico')).headers.get('content-type'), 'image/x-icon');
    assert.equal((await fetch(base + '/health')).status, 200);
    assert.equal((await fetch(base + '/../src/server.js')).headers.get('content-type'), 'text/html; charset=utf-8');
  } finally {
    server.close();
  }
});
