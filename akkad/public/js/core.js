// Shared pieces: saved state, API calls, router, icons, pop-ups, sliders.

/* ---------- state remembered on this phone and browser ---------- */
const KEY = 'akkad.v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const S = Object.assign({ area: null, keys: {}, draft: {} }, read());
delete S.session; // sessions now live in an HttpOnly cookie, never in page storage
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };
export let site = null;
export let me = { state: 'none', upcoming: [], warranties: [], past: [], ended: [], cancelled: [], credit: 0 };

/* ---------- api ---------- */
export async function api(path, body, opts = {}) {
  const headers = {};
  if (opts.key) headers['x-akkad-key'] = opts.key;
  if (body) { headers['content-type'] = 'application/json'; headers['x-akkad'] = '1'; } // the server refuses changes without this header
  let res;
  try { res = await fetch('/api' + path, { method: body ? 'POST' : 'GET', headers, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error('No connection. Please check your internet and try again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Something went wrong. Please try again.'); e.status = res.status; e.data = data; throw e; }
  return data;
}
// Downloads a file that needs the booking key (sent as a header, so it never appears in a link).
export async function download(path, filename, key) {
  const res = await fetch('/api' + path, { headers: key ? { 'x-akkad-key': key } : {}, credentials: 'same-origin' });
  if (!res.ok) throw new Error('We could not prepare that file. Please try again.');
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export const bookingApi = (id, sub = '', body) => api(`/bookings/${id}${sub}`, body, { key: S.keys[id] });
export async function loadSite() { site = await api('/site'); return site; }
export async function loadMe() {
  try { me = await api('/me', { keys: S.keys }); } catch { /* keep last */ }
  return me;
}
export function remember(booking) { S.keys[booking.id] = booking.key; save(); }

/* ---------- small helpers ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const aed = (n) => 'AED ' + (Number.isInteger(n) ? n : n.toFixed(2));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function on(root, sel, fn, type = 'click') {
  root.addEventListener(type, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(t, e); });
}
export function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200);
}
export async function busy(btn, fn) {
  if (btn.classList.contains('busy')) return;
  btn.classList.add('busy');
  try { return await fn(); } finally { btn.classList.remove('busy'); }
}
export function showErr(root, e) { const el = $('.err', root); if (el) { el.textContent = e.message || e; el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } else toast(e.message || e); }

/* ---------- icons ---------- */
const P = {
  pin: '<path d="M12 21s7-6.2 7-11.500a7 7 0 1 0-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.300"/>',
  phone: '<path d="M5 3.500h3.200l1.500 4.300-2 1.500a12 12 0 0 0 7 7l1.500-2 4.300 1.500V19a2 2 0 0 1-2.200 2A17 17 0 0 1 3 5.700 2 2 0 0 1 5 3.500z"/><path d="M14.500 3.500a6 6 0 0 1 6 6" opacity="0"/>',
  chat: '<path d="M12 3.500a8.500 8.500 0 0 0-7.300 12.800L3.500 20.500l4.400-1.100A8.500 8.500 0 1 0 12 3.500z"/>',
  image: '<rect x="3" y="4.500" width="18" height="15" rx="2.500"/><circle cx="8.500" cy="10" r="1.700"/><path d="m4 17.500 5-4.500 3.500 3 3-2.500 4.500 4"/>',
  card: '<rect x="2.500" y="5" width="19" height="14" rx="2.500"/><path d="M2.500 10h19"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.300 2.800 2.800L16 9.500"/>',
  tick: '<path d="m5 12.500 4.500 4.500L19 7"/>',
  shield: '<path d="M12 3 4.500 6v5.500c0 4.800 3.200 8 7.500 9.500 4.300-1.500 7.500-4.700 7.500-9.500V6z"/><path d="m8.800 12 2.300 2.300 4.200-4.600"/>',
  truck: '<path d="M2.500 6.500h11v10h-11z"/><path d="M13.500 10h4l3.500 3.500v3h-7.500"/><circle cx="7" cy="17.500" r="1.900"/><circle cx="17" cy="17.500" r="1.900"/>',
  calendar: '<rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
  camera: '<path d="M4 7.500h3l1.500-2.500h7L17 7.500h3a1.500 1.500 0 0 1 1.500 1.500v9.500A1.500 1.500 0 0 1 20 20H4a1.500 1.500 0 0 1-1.500-1.500V9A1.500 1.500 0 0 1 4 7.500z"/><circle cx="12" cy="13.500" r="3.500"/>',
  down: '<path d="m6 9 6 6 6-6"/>', left: '<path d="m14.500 5.500-6 6.500 6 6.500"/>', right: '<path d="m9.500 5.500 6 6.500-6 6.500"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.2"/>',
  search: '<circle cx="11" cy="11" r="6.500"/><path d="m16 16 4.500 4.500"/>',
  bug: '<rect x="8" y="7.500" width="8" height="12" rx="4"/><path d="M9.500 7.500a2.500 2.500 0 0 1 5 0M8 11H4.500M8 15H4.500M16 11h3.500M16 15h3.500M9 6 7 3.500M15 6l2-2.500M8.500 18.500 6 21M15.500 18.500 18 21"/>',
  doc: '<rect x="5" y="3" width="14" height="18" rx="1.500"/><path d="M8.500 8h7M8.500 12h7M8.500 16h7"/>',
  arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
};
export const icon = (name, size = 24, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name]}</svg>`;
export const stars = (n = 5) => `<span class="stars" aria-label="${n} out of 5 stars">${'★'.repeat(n)}${n < 5 ? `<span style="opacity:.3">${'★'.repeat(5 - n)}</span>` : ''}</span>`;
// Photo slot. Drop real images in /public/img and pass `src` to show them.
// Image for a photo slot label (from data/catalog.js PHOTOS), or for a service id.
export const imgFor = (label) => (site && site.photos && site.photos[label]) || '';
export const pestImg = (id) => { const p = site && site.pests.find((x) => x.id === id); return p ? imgFor(p.photo) : ''; };
// Accepted payment logos (images in /img/brand).
const PAY_NAMES = { visa: 'Visa', mastercard: 'Mastercard', 'apple-pay': 'Apple Pay', tabby: 'Tabby' };
export const payLogos = (list = ['visa', 'mastercard', 'apple-pay', 'tabby'], cls = '') => `<span class="pay-logos ${cls}">${list.map((n) => `<img src="/img/brand/${n}.png" alt="${PAY_NAMES[n]}" width="51" height="20" loading="lazy">`).join('')}</span>`;
// "Need a hand?" box with Call and WhatsApp, for pages where a customer can get stuck.
export const helpBox = (title = 'Need a hand?', text = 'Our team can find your booking for you.') => `<div class="help-box"><span class="ic-circle">${icon('chat', 22)}</span><div class="hb-text"><b>${esc(title)}</b><span>${esc(text)}</span></div><div class="hb-btns"><a class="btn ghost sm" href="${site.company.phoneHref}">${icon('phone', 16)}Call</a><a class="btn sm" href="${site.company.whatsapp}" target="_blank" rel="noopener">${icon('chat', 16)}WhatsApp</a></div></div>`;
// One tile of the "which pest" picker: photo, name, signs and starting price.
export const pestTile = (p, pressed) => {
  const img = pestImg(p.id);
  return `<button data-p="${p.id}"${pressed ? ' aria-pressed="false"' : ''}>
    <span class="pt-img"${img ? ` style="background-image:url('${esc(img)}')"` : ''}>${img ? '' : icon('bug', 34)}</span>
    <span class="pt-body"><b>${esc(p.name)}</b><span class="pt-signs">${esc(p.signs)}</span>
      <span class="pt-price${p.from ? '' : ' survey'}">${p.from ? `From <strong>AED ${p.from}</strong>` : esc(p.fromLabel)}</span></span>
    <span class="pt-check" aria-hidden="true">${icon('tick', 16)}</span></button>`;
};
export const photo = (label, src = imgFor(label)) => `<div class="photo"${src ? ` style="background-image:url('${esc(src)}')" role="img" aria-label="${esc(label)}"` : ''}>${src ? '' : icon('image') + `<span>${esc(label)}</span>`}</div>`;
export const lines = (rows, total) => `<div class="lines">${rows.map(([a, b, cls]) => `<div><span>${a}</span><span class="${cls || ''}">${b}</span></div>`).join('')}${total ? `<div class="total"><span>${total[0]}</span><span>${total[1]}</span></div>` : ''}</div>`;

/* ---------- pop-ups (centered) and sheets (from the bottom on phones) ---------- */
let layerClose = null;
let layerOpener = null;
const focusable = (box) => $$('a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex="0"]', box).filter((el) => el.offsetParent !== null);
export function openLayer(type, html, { onClose, mount } = {}) {
  const layer = $('#layer');
  if (!layer.classList.contains('open')) layerOpener = document.activeElement;
  layer.innerHTML = `<div class="shade" data-close></div><div class="box ${type}" tabindex="-1"><button class="x" data-close aria-label="Close">${icon('x')}</button>${html}</div>`;
  layer.classList.add('open');
  document.body.style.overflow = 'hidden';
  layerClose = onClose || null;
  const box = $('.box', layer);
  box.focus({ preventScroll: true });
  if (mount) mount(box);
  return box;
}
export function closeLayer(silent) {
  const layer = $('#layer');
  if (!layer.classList.contains('open')) return;
  layer.classList.remove('open'); layer.innerHTML = '';
  document.body.style.overflow = '';
  const fn = layerClose; layerClose = null;
  if (layerOpener && document.contains(layerOpener) && !silent) layerOpener.focus({ preventScroll: true });
  layerOpener = null;
  if (fn && !silent) fn();
}
document.addEventListener('click', (e) => { if (e.target.closest('#layer [data-close]')) closeLayer(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return closeLayer();
  // Keep keyboard focus inside an open pop-up.
  const layer = $('#layer');
  if (e.key !== 'Tab' || !layer.classList.contains('open')) return;
  const els = focusable($('.box', layer));
  if (!els.length) return;
  const first = els[0], last = els[els.length - 1];
  if (!layer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ---------- sliders ---------- */
export function slider(root) {
  const track = $('.track', root);
  if (!track) return;
  const items = [...track.children];
  const dots = $('.dots', root);
  if (dots) dots.querySelectorAll('i').forEach((d) => d.remove());
  const dotEls = items.map(() => { const i = document.createElement('i'); if (dots) dots.insertBefore(i, $('.next', dots)); return i; });
  const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth);
  const current = () => Math.min(items.length - 1, Math.round(track.scrollLeft / step()));
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 4;
    const i = track.scrollLeft >= max ? items.length - 1 : current();
    const first = current();
    const visible = Math.max(1, Math.round(track.clientWidth / step()));
    dotEls.forEach((d, k) => d.classList.toggle('on', k === (visible > 1 ? first : i)));
    dotEls.forEach((d, k) => { d.hidden = visible > 1 && k > items.length - visible; });
    $$('.prev', root).forEach((b) => { b.disabled = track.scrollLeft < 4; });
    $$('.next', root).forEach((b) => { b.disabled = track.scrollLeft >= max; });
  };
  on(root, '.prev', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  on(root, '.next', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);
  sync();
}
export const sliderHtml = (cards, { arrows = 'side', cls = '' } = {}) => `
  <div class="slider">
    ${arrows === 'side' ? `<button class="nav-btn prev" aria-label="Previous">${icon('left', 20)}</button><button class="nav-btn next" aria-label="Next">${icon('right', 20)}</button>` : ''}
    <div class="track ${cls}">${cards.join('')}</div>
    <div class="dots">${arrows === 'dots' ? `<button class="nav-btn prev" aria-label="Previous">${icon('left', 20)}</button><button class="nav-btn next" aria-label="Next">${icon('right', 20)}</button>` : '<span class="next" hidden></span>'}</div>
  </div>`;

/* ---------- router ---------- */
const routes = [];
export const route = (pattern, handler) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'), handler });
let cleanup = [];
export const onLeave = (fn) => cleanup.push(fn);
let navToken = 0;
export function go(path, { replace } = {}) {
  if (replace) history.replaceState(null, '', path); else history.pushState(null, '', path);
  return render();
}
export let shell = { paint() {} };
export const setShell = (s) => { shell = s; };

export async function render() {
  const mine = ++navToken;
  closeLayer(true);
  cleanup.forEach((fn) => fn()); cleanup = [];
  const url = new URL(location.href);
  const view = $('#view');
  let match = null, handler = null;
  for (const r of routes) { const m = r.re.exec(url.pathname); if (m) { match = m; handler = r.handler; break; } }
  let page;
  try {
    page = handler ? await handler({ ...(match.groups || {}) }, url.searchParams) : notFound();
  } catch (e) {
    if (e.status === 401) { if (mine === navToken) go('/find', { replace: true }); return; }
    page = { title: 'Something went wrong', html: `<div class="flow"><h1>We could not load this page</h1><p class="muted">${esc(e.message)}</p><a class="btn" href="/">Back to the homepage</a></div>` };
  }
  if (mine !== navToken || !page) return;
  document.title = (page.title ? page.title + ' | ' : '') + 'Akkad Pest Control';
  view.innerHTML = page.html;
  shell.paint(page);
  if (page.mount) page.mount(view);
  $$('.slider', view).forEach(slider);
  if (url.hash && $(url.hash)) $(url.hash).scrollIntoView(); else window.scrollTo(0, 0);
}
const notFound = () => ({ title: 'Page not found', html: `<div class="flow"><h1>We could not find that page</h1><p class="muted">The link may be old. Everything starts from the homepage.</p><a class="btn" href="/">Go to the homepage</a></div>` });

window.addEventListener('popstate', render);
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (!href.startsWith('/') || href.startsWith('/api/')) return;
  e.preventDefault();
  const url = new URL(href, location.href);
  if (url.pathname === location.pathname && url.hash) { const el = $(url.hash); if (el) el.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', href); return; }
  go(href);
});
