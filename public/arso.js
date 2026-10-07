import { startTopo } from './topo.js';

const cfg = window.ARSO || {};

// Links that come from deploy-time settings (AZWO_URL, THEME_URL, ...).
for (const a of document.querySelectorAll('[data-link]')) {
  const url = cfg[a.dataset.link];
  if (url) a.href = url;
}

// The theme goes from "coming soon" to "available" as soon as THEME_URL is set.
if (cfg.THEME_URL) {
  for (const s of document.querySelectorAll('[data-status="THEME_URL"]')) { s.className = 'status on'; s.innerHTML = '<span class="pulse"></span>متاح الآن'; }
  const h = document.querySelector('[data-theme-status]');
  if (h) h.textContent = 'الثيم متاح في متجر ثيمات سلة';
  const b = document.querySelector('[data-link="THEME_URL"]');
  if (b) b.textContent = 'شاهد الثيم';
}

// Contact buttons appear only for the channels that are configured.
const actions = document.getElementById('contact-actions');
const add = (href, label, ghost = true) => {
  const a = document.createElement('a');
  a.className = ghost ? 'btn ghost' : 'btn';
  a.href = href;
  a.textContent = label;
  if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  actions.prepend(a);
};
if (cfg.CONTACT_EMAIL) add(`mailto:${cfg.CONTACT_EMAIL}`, `راسلنا: ${cfg.CONTACT_EMAIL}`);
if (cfg.CONTACT_WHATSAPP) add(`https://wa.me/${cfg.CONTACT_WHATSAPP.replace(/\D/g, '')}`, 'تواصل عبر واتساب', false);

document.getElementById('year').textContent = new Date().getFullYear();

// Sections fade up once as they enter the viewport; anything already visible shows at once.
const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
if (io) {
  for (const el of document.querySelectorAll('.block .head, .cards > *, .split, .steps, .grid-features, .audience, .principles > *, .timeline, .next, .faq, .contact')) {
    const r = el.getBoundingClientRect();
    if (r.top > innerHeight) { el.classList.add('reveal'); io.observe(el); }
  }
}

startTopo();
