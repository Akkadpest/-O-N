// Entry point: paints the header, bars and footer around each page, then starts the router.
import { S, site, me, loadSite, loadMe, render, setShell, go, esc, icon, on, $, openLayer, payLogos } from './core.js';
import { checkAvailability, book, areaUrl, warrantyEntry } from './flows.js';
import './pages-home.js';
import './pages-book.js';
import './pages-manage.js';
import './pages-info.js';
import './chat.js';

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
    <a class="brand ${areaHead ? 'compact' : ''}" href="/" aria-label="Akkad Pest Control home"><img class="brand-logo" src="/img/brand/akkad-logo.png" alt="Akkad" width="32" height="32"><span>Pest Control</span></a>
    ${areaHead ? `<div class="areachip mob">${icon('pin', 22)}<span>${esc(S.area.name)}</span><a class="link" href="/area">Change</a></div>` : ''}
    <nav aria-label="Main"><a href="/services">Services</a><a href="/warranty">Warranty</a><a href="/commercial">Commercial</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
    <div class="tools">
      <a class="phone desk" href="${c.phoneHref}">${icon('phone', 20)}${c.phone}</a>
      ${known ? `<a class="mybk ${areaHead ? 'compact' : ''}" href="/my-bookings" aria-label="My bookings">${icon('calendar', 18)}<span>${me.upcoming.length + me.warranties.length > 1 ? 'My bookings' : 'My booking'}</span>${up ? '<i></i>' : ''}</a>`
        : `<a class="link desk" href="/find" style="white-space:nowrap">My booking</a>`}
      ${known || areaHead ? '' : `<a class="hd-warranty mob" href="/warranty">${icon('shield', 16)}Warranty</a>`}
      ${known || areaHead ? '' : `<a class="icon-btn mob" href="${c.phoneHref}" aria-label="Call Akkad">${icon('phone')}</a>`}
      <button class="icon-btn" data-chat aria-label="Chat with an agent" aria-haspopup="dialog">${icon('chat')}</button>
      <button class="btn desk" data-book>Book</button>
      <button class="icon-btn mob" data-menu aria-label="Menu" aria-haspopup="dialog">${icon('menu')}</button>
    </div></div>`;

  const banner = $('#banner');
  banner.hidden = !(up && page.banner !== false);
  if (up) banner.innerHTML = `<div class="wrap"><a href="/booking/${up.id}${up.tracking ? '/track' : ''}">${icon(up.tracking ? 'truck' : 'calendar', 20)}<span>${up.tracking ? 'Your technician is on the way' : 'Your visit: ' + esc(up.when)}</span><b>${up.tracking ? 'Track' : 'Manage'} ›</b></a></div>`;

  $('#bar').innerHTML = `<a class="btn ghost" href="${c.phoneHref}">Call</a><a class="btn ghost" href="${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><button class="btn" data-book>Book</button>`;

  const svc = site.pests.filter((p) => p.id !== 'amc' && site.services[p.id]).map((p) => `<li><a href="/services/${site.services[p.id].slug}">${esc(p.service)}</a></li>`).join('');
  const foot = $('#foot');
  foot.className = page.flow ? 'mob-hide' : '';
  foot.innerHTML = `<div class="wrap">
    <div class="f-grid">
      <div class="f-brand">
        <a class="f-logo" href="/" aria-label="Akkad Pest Control home"><img class="brand-logo" src="/img/brand/akkad-logo.png" alt="Akkad" width="36" height="36"><span>Pest Control</span></a>
        <p>Licensed pest control for homes and businesses in Dubai, Sharjah and Ajman. Pests gone, or we come back free.</p>
        <ul class="f-contact">
          <li>${icon('pin', 17)}<a href="/contact">${esc(c.address)}</a></li>
          <li>${icon('phone', 17)}<a href="${c.phoneHref}">${esc(c.phone)}</a></li>
          <li>${icon('chat', 17)}<a href="${c.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></li>
          ${c.email ? `<li>${icon('doc', 17)}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
          ${c.hours ? `<li>${icon('calendar', 17)}<span>${esc(c.hours)}</span></li>` : ''}
        </ul>
      </div>
      <div><h4>Services</h4><ul>${svc}</ul></div>
      <div><h4>Company</h4><ul><li><a href="/about">About us</a></li><li><a href="/commercial">Commercial</a></li><li><a href="/contact">Contact</a></li><li><a href="/guide">Pest guide</a></li><li><a href="/area">Check your area</a></li></ul></div>
      <div><h4>Your booking</h4><ul><li><a href="/manage">Manage my booking</a></li><li><a href="/find">Find my bookings</a></li><li><a href="/warranty">Warranty visit</a></li><li><a href="/cancellation-policy">Cancellation policy</a></li></ul></div>
    </div>
    <div class="f-pay"><span>We accept</span>${payLogos()}</div>
    <div class="f-legal"><span>© ${new Date().getFullYear()} ${esc(c.name)}</span><span>Dubai Municipality licence and registration numbers</span><span class="f-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cancellation-policy">Cancellation</a></span>${c.mapsUrl ? `<a href="${c.mapsUrl}" target="_blank" rel="noopener">Akkad on Google</a>` : ''}</div>
  </div>`;
}
setShell({ paint });

on(document, '[data-book]', () => book());
// Screen 15 says "from the menu or footer": the phone menu.
on(document, '[data-menu]', () => {
  const row = (ic, label, href, attr = '') => `<a class="card ic-row menu-row" href="${href}" ${attr}>${icon(ic, 24)}<span class="grow">${label}</span>${icon('right', 18)}</a>`;
  const box = openLayer('sheet', `<h2 class="plain">Menu</h2>
    ${row('bug', 'Services and prices', '/services')}${row('doc', 'Commercial', '/commercial')}${row('check', 'About us', '/about')}${row('chat', 'Contact', '/contact')}${row('pin', 'Check your area', '/area')}${row('info', 'Pest guide', '/guide')}
    <p class="muted" style="margin-top:16px">Your booking</p>
    ${row('calendar', me.state !== 'none' || me.verified ? 'My bookings' : 'Find my bookings', me.state !== 'none' || me.verified ? '/my-bookings' : '/find')}${row('calendar', 'Manage my booking', '/manage')}
    <button class="card ic-row menu-row" data-menu-warranty>${icon('shield', 24)}<span class="grow">Request a warranty visit</span>${icon('right', 18)}</button>
    ${row('doc', 'Termite or commercial inspection', '/inspection')}${row('camera', 'Send a photo, we identify it free', '/photos?mode=identify')}
    <div class="menu-actions"><a class="btn ghost" href="${site.company.phoneHref}">${icon('phone', 18)}Call</a><button class="btn ghost" data-chat>${icon('chat', 18)}Chat</button><button class="btn" data-book>Book</button></div>`);
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
