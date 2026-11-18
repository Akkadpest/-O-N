// Entry point: paints the header, bars and footer around each page, then starts the router.
import { S, save, site, me, loadSite, loadMe, render, setShell, go, esc, icon, on, $, openLayer } from './core.js';
import { checkAvailability, book, areaUrl, warrantyEntry } from './flows.js';
import './pages-home.js';
import './pages-book.js';
import './pages-manage.js';

function paint(page) {
  const c = site.company;
  const known = me.state !== 'none' || me.verified;
  const up = me.upcoming[0];
  const areaHead = page.head === 'area' && S.area;
  document.body.classList.toggle('has-bar', !!page.bar);

  const loc = $('#locbar');
  loc.className = page.loc ? '' : 'mob-hide';
  loc.innerHTML = `<div class="wrap"><button data-loc>${icon('pin', 20)}<span>${esc(S.area ? S.area.name : "Check who's near you")}</span>${icon('down', 18)}</button>
    ${S.area ? '<a class="chg" href="/area">Change area</a>' : ''}<span class="right">Technicians available today in Dubai, Sharjah and Ajman</span></div>`;

  $('#hdr').innerHTML = `<div class="wrap">
    <a class="brand ${areaHead ? 'desk' : ''}" href="/" aria-label="Akkad Pest Control home"><b>${c.brand}</b><span>Pest Control</span></a>
    ${areaHead ? `<div class="areachip mob">${icon('pin', 22)}<span>${esc(S.area.name)}</span><a class="link" href="/area">Change</a></div>` : ''}
    <nav aria-label="Main"><a href="/#services">Services</a><a href="/#how">How it works</a><a href="/#coverage">Coverage</a><a href="/#reviews">Reviews</a><a href="/#guide">Questions</a></nav>
    <div class="tools">
      <a class="phone desk" href="${c.phoneHref}">${icon('phone', 20)}${c.phone}</a>
      ${known ? `<a class="mybk ${areaHead ? 'compact' : ''}" href="/my-bookings" aria-label="My bookings">${icon('calendar', 18)}<span>${me.upcoming.length + me.warranties.length > 1 ? 'My bookings' : 'My booking'}</span>${up ? '<i></i>' : ''}</a>`
        : `<a class="link desk" href="/find" style="white-space:nowrap">My booking</a>`}
      ${known && !areaHead ? '' : `<a class="icon-btn mob" href="${c.phoneHref}" aria-label="Call Akkad">${icon('phone')}</a><a class="icon-btn mob" href="${c.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp Akkad">${icon('chat')}</a>`}
      <a class="icon-btn desk" href="${c.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp Akkad">${icon('chat')}</a>
      <button class="btn desk" data-book>Book</button>
      <button class="icon-btn mob" data-menu aria-label="Menu" aria-haspopup="dialog">${icon('menu')}</button>
    </div></div>`;

  const banner = $('#banner');
  banner.hidden = !(up && page.banner !== false);
  if (up) banner.innerHTML = `<div class="wrap"><a href="/booking/${up.id}${up.tracking ? '/track' : ''}">${icon(up.tracking ? 'truck' : 'calendar', 20)}<span>${up.tracking ? 'Your technician is on the way' : 'Your visit: ' + esc(up.when)}</span><b>${up.tracking ? 'Track' : 'Manage'} ›</b></a></div>`;

  $('#bar').innerHTML = `<a class="btn ghost" href="${c.phoneHref}">Call</a><a class="btn ghost" href="${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><button class="btn" data-book>Book</button>`;

  const svc = site.pests.slice(0, 5).map((p) => `<a href="/#services" data-svc="${p.id}">${esc(p.service)}</a>`);
  const foot = $('#foot');
  foot.className = page.flow ? 'mob-hide' : '';
  foot.innerHTML = `<div class="wrap"><div class="cols">
    <div><b>${esc(c.name)}</b><span class="sep"> · </span><a class="u mob" href="/manage" style="display:inline">Manage my booking</a><br>${esc(c.address)} · <a href="${c.phoneHref}" style="display:inline">${c.phone}</a></div>
    <div><h4>Services</h4>${svc.join('<span class="sep"> · </span>')}</div>
    <div><h4>Areas</h4><a href="/area?emirate=Dubai">Pest control Dubai</a><span class="sep"> · </span><a href="/area?emirate=Sharjah">Sharjah</a><span class="sep"> · </span><a href="/area?emirate=Ajman">Ajman</a></div>
    <div class="desk"><h4>Your booking</h4><a href="/manage">Manage my booking</a><a href="/find">Find my bookings</a><a href="/warranty">Request a warranty visit</a><a href="/inspection">Termite or commercial inspection</a></div>
    </div><div class="legal">Dubai Municipality licence and registration numbers</div></div>`;
}
setShell({ paint });

on(document, '[data-book]', () => book());
// A service link anywhere (footer, menu) starts that service: inspection request or the booking flow.
on(document, '#foot [data-svc], #layer [data-svc]', (a, e) => {
  e.preventDefault();
  const p = site.pests.find((x) => x.id === a.dataset.svc);
  if (p.inspection) return go(`/inspection?job=${p.commercial ? 'amc' : 'termite'}`);
  S.draft = { ...S.draft, preset: p.id }; save(); book();
});
// Screen 15 says "from the menu or footer": the phone menu.
on(document, '[data-menu]', () => {
  const row = (ic, label, href, attr = '') => `<a class="card ic-row menu-row" href="${href}" ${attr}>${icon(ic, 24)}<span class="grow">${label}</span>${icon('right', 18)}</a>`;
  const box = openLayer('sheet', `<h2 class="plain">Menu</h2>
    ${row('bug', 'Services and prices', '/#services')}${row('check', 'How it works', '/#how')}${row('pin', 'Areas we cover', '/#coverage')}${row('chat', 'Reviews', '/#reviews')}${row('info', 'Common questions', '/#guide')}
    <p class="muted" style="margin-top:16px">Your booking</p>
    ${row('calendar', me.state !== 'none' || me.verified ? 'My bookings' : 'Find my bookings', me.state !== 'none' || me.verified ? '/my-bookings' : '/find')}${row('calendar', 'Manage my booking', '/manage')}
    <button class="card ic-row menu-row" data-menu-warranty>${icon('shield', 24)}<span class="grow">Request a warranty visit</span>${icon('right', 18)}</button>
    ${row('doc', 'Termite or commercial inspection', '/inspection')}${row('camera', 'Send a photo, we identify it free', '/photos?mode=identify')}
    <div class="row" style="margin-top:14px"><a class="btn ghost" href="${site.company.phoneHref}">Call</a><button class="btn" data-book>Book</button></div>`);
  on(box, '[data-menu-warranty]', () => warrantyEntry());
});
on(document, '[data-check]', (el) => { if (!el.closest('#layer')) checkAvailability(); });
on(document, '[data-loc]', () => (S.area ? go(areaUrl()) : checkAvailability()));
window.addEventListener('scroll', () => $('#hdr').classList.toggle('stuck', scrollY > 8), { passive: true });

(async () => {
  try { await Promise.all([loadSite(), loadMe()]); } catch (e) {
    $('#view').innerHTML = `<div class="flow"><h1>We could not load the site</h1><p class="muted">${esc(e.message)}</p></div>`;
    return;
  }
  render();
})();
