// Static server for the ARSO site (the ARSO Claude course). No dependencies.
// Product links and contact details come from environment variables (AZWO_URL, THEME_URL,
// CONTACT_EMAIL, CONTACT_WHATSAPP) via /config.js, so they change in Railway without touching code.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};
const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'",
};

export function publicConfig(env = process.env) {
  const out = {};
  // Only named product links (and PUBLIC_*_URL for future services) ever reach the browser,
  // never other variables the host happens to define.
  for (const [k, v] of Object.entries(env)) {
    const allowed = k === 'AZWO_URL' || k === 'THEME_URL' || /^PUBLIC_[A-Z0-9_]+_URL$/.test(k);
    if (allowed && /^https?:\/\//.test(v)) out[k] = v;
  }
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.CONTACT_EMAIL || '')) out.CONTACT_EMAIL = env.CONTACT_EMAIL;
  if (/^\+?[\d\s-]{8,20}$/.test(env.CONTACT_WHATSAPP || '')) out.CONTACT_WHATSAPP = env.CONTACT_WHATSAPP;
  return out;
}

export async function handle(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end('{"ok":true}');
  }
  if (pathname === '/config.js') {
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-cache', ...HEADERS });
    return res.end(`window.ARSO = ${JSON.stringify(publicConfig()).replace(/</g, '\\u003c')};\n`);
  }
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  let file = join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR) || !extname(rel) || !existsSync(file)) file = join(PUBLIC_DIR, 'index.html');
  const ext = extname(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600', ...HEADERS });
  res.end(await readFile(file));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer((req, res) => handle(req, res).catch((e) => { console.error(e); res.writeHead(500); res.end(); }))
    .listen(PORT, () => console.log(`أرسو على http://localhost:${PORT}`));
}
