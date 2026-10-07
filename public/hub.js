import { APPS } from './apps.js';
import { startInk } from './ink.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const urls = window.HUB_URLS || {};

const apps = APPS.map((a) => ({ ...a, url: (a.env && urls[a.env]) || a.url }))
  .map((a) => ({ ...a, status: a.status === 'live' && !a.url ? 'soon' : a.status }));

const card = (a, i) => {
  const live = a.status === 'live';
  const inner = `
    <div class="card-top">
      <span class="mark">${a.icon ? `<img src="/${esc(a.icon)}" alt="">` : '<span class="plus" aria-hidden="true">+</span>'}</span>
      <span class="status ${live ? 'on' : ''}">${live ? '<span class="pulse"></span>يعمل' : 'قريباً'}</span>
    </div>
    <p class="en">${esc(a.en)}</p>
    <h2>${esc(a.name)}</h2>
    <p class="tagline">${esc(a.tagline)}</p>
    <p class="desc">${esc(a.description)}</p>
    ${a.features.length ? `<ul class="chips">${a.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    <span class="go">${live ? 'دخول النظام <span aria-hidden="true">←</span>' : 'ترقّبوه'}</span>`;
  return live
    ? `<a class="card live" id="${esc(a.id)}" href="${esc(a.url)}" style="--i:${i}">${inner}</a>`
    : `<div class="card soon" id="${a.id === 'next' ? 'soon' : esc(a.id)}" style="--i:${i}">${inner}</div>`;
};

document.getElementById('systems').innerHTML = apps.map(card).join('');
document.getElementById('live-count').textContent = apps.filter((a) => a.status === 'live').length;
document.getElementById('year').textContent = new Date().getFullYear();

// Riyadh time, independent of the visitor's device timezone.
const clock = document.getElementById('clock');
const tick = () => { clock.textContent = new Date(Date.now() + 3 * 3600_000).toISOString().slice(11, 16); };
tick();
setInterval(tick, 10_000);

// Cards tilt slightly toward the pointer.
if (matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
  for (const el of document.querySelectorAll('.card')) {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
}

startInk();
