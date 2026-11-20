// The booking shop: one page used by the homepage and by every area page.
// The customer picks a service, adds it to "Your booking" and continues to time and payment.
// Same page for everyone, personalised by the customer's area (S.area) or by the area page it is on.
import { S, save, site, go, esc, icon, aed, wty, stepsHtml, photo, imgFor, pestImg, stars, sliderHtml, on, $, $$, openLayer, closeLayer, toast, onLeave, payLogos } from './core.js';
import { checkAvailability } from './flows.js';
import { chosen, shortSize, ensureSize, sizeControls, wireSizeControls } from './pages-book.js';

const setDraft = (patch) => { S.draft = { ...S.draft, ...patch }; save(); };
const express = () => S.draft.timing !== 'scheduled';
const pestById = (id) => site.pests.find((p) => p.id === id);
// Pest illustrations for tiles, tabs and the basket; commercial falls back to its photo.
const PEST_ICONS = ['cockroach', 'bedbugs', 'ants', 'rodents', 'termites', 'mosquitoes', 'flies'];
export const pestIcon = (id) => (PEST_ICONS.includes(id) ? `/img/pests/${id}.webp` : pestImg(id));
const fromOf = (p, pk) => (pk.sized ? p.sizes[pk.sized][0].price : pk.price);

/* ---------- reviews (also used on the area pages) ---------- */
const googleCard = (r) => `<article class="card rev"><div class="who"><span class="av">${esc(r.initials)}</span><div><b>${esc(r.name)}</b><small>${esc(r.when)} · ${esc(r.area)}</small></div><span class="gl" aria-label="Google review">G</span></div>${stars(r.stars)}<blockquote>"${esc(r.text)}"</blockquote></article>`;
export const googleBlock = (list, title, count) => `
  <div class="rev-head">
    <div><h2 class="sec-h">${title}</h2>
      <p class="rev-score"><b>${site.company.rating}</b>${stars(5)}<span>${count || 'Google reviews'}</span></p></div>
    <a class="rev-link" href="${site.company.mapsUrl || site.company.googleReviewsUrl}" target="_blank" rel="noopener">Read all on Google${icon('arrow', 16)}</a>
  </div>
  ${sliderHtml(list.map(googleCard), { arrows: 'dots' })}`;

/* ---------- "What your neighbors say": verified Akkad jobs, with a pest filter ---------- */
const pestName = (id) => (pestById(id) || {}).name || '';
const jobCard = (r, area) => `<article class="card rev job nb" data-pest="${r.pest}">
    <div class="nb-head"><span class="av g">${esc(r.initials)}</span>
      <div class="nb-who"><b>${esc(r.name)}</b><small>${esc(r.home)}${area ? ` · ${esc(area.short)}` : ''}</small></div>
      <span class="nb-ver">${icon('shield', 13)}Verified</span></div>
    <div class="nb-rate">${stars(r.stars)}<small>${esc(r.date)}</small></div>
    <blockquote>"${esc(r.text)}"</blockquote>
    <div class="nb-foot"><span class="nb-pest"><i style="background-image:url('${esc(pestIcon(r.pest))}')"></i>${esc(pestName(r.pest))} · ${esc(r.method)}</span><span>${icon('truck', 14)}Arrived in ${r.arrived} min</span></div>
  </article>`;
function neighborsBlock(ctx, area) {
  const list = ctx.neighborReviews || site.neighborReviews || [];
  if (!list.length) return '';
  const top = ctx.top && list.some((r) => r.pest === ctx.top) ? ctx.top : '';
  // Reviews for the pest most booked in this area come first.
  const ordered = top ? [...list.filter((r) => r.pest === top), ...list.filter((r) => r.pest !== top)] : list;
  const where = ctx.area ? area.short : '';
  return `<section class="st-block" id="neighbors" data-first="${top}">
    <h2>${where ? `What your neighbours in ${esc(where)} say about Akkad` : 'What your neighbours say about Akkad'}</h2>
    <p class="rev-score"><b>${ctx.stats ? ctx.stats.rating : site.company.rating}</b>${stars(5)}<span>${ctx.stats ? `from ${ctx.stats.homes} verified Akkad jobs in ${esc(where)}` : 'from verified Akkad jobs'}</span></p>
    ${sliderHtml(ordered.map((r) => jobCard(r, ctx.area ? area : null)))}</section>`;
}

/* ---------- pieces of the page ---------- */
const bugTile = (p) => `<button class="bug" data-jump="${p.id}"><span class="bug-img" style="background-image:url('${esc(pestIcon(p.id))}')"></span><span>${esc(p.name)}</span></button>`;

// A package card: name, two facts, price and one button. The picture and the details open on the next screen.
const pkName = (pk) => { const n = pk.title.split(': ')[1] || pk.title; return n.charAt(0).toUpperCase() + n.slice(1); };
const pkPhoto = (p, pk) => imgFor(pk.photo) || imgFor(p.photo);
export const pkgCard = (p, pk) => `<article class="card pk">
    <button class="pk-pic" data-info="${p.id}:${pk.id}" aria-label="Details of ${esc(pk.title)}"${pkPhoto(p, pk) ? ` style="background-image:url('${esc(pkPhoto(p, pk))}')"` : ''}></button>
    <div class="pk-main">${pk.badge ? `<span class="tag">${esc(pk.badge)}</span>` : ''}<h3>${esc(pkName(pk))}</h3>
      <div class="st-meta"><span>${icon('shield', 15)}${wty(p)}</span>${p.warrantyMonths ? `<span>${icon('calendar', 15)}${esc(pk.duration)}</span>` : ''}</div>
      <button class="link b" data-info="${p.id}:${pk.id}">Details ›</button></div>
    <div class="pk-side"><div class="price">${pk.sized ? '<small>From</small> ' : ''}${aed(fromOf(p, pk))}</div>
      <button class="btn add" data-add="${p.id}:${pk.id}" aria-label="Add ${esc(pk.title)}">Add</button></div></article>`;

// Inspection-first services: what the survey is, in plain words.
const SURVEY = {
  termites: ['Termite inspection and treatment plan', 'A specialist checks walls, floors and door frames, then gives you a fixed price before any work starts.'],
  amc: ['Annual contract for your business', 'Scheduled visits, service reports for your inspections, and call-outs included. Restaurants, offices, buildings and warehouses.'],
};
export const surveyCard = (p) => {
  const href = `/inspection?job=${p.commercial ? 'amc' : 'termite'}`;
  const img = imgFor(p.photo);
  return `<article class="card pk pk-survey">
    <a class="pk-pic" href="${href}" aria-label="${esc((SURVEY[p.id] || [p.service])[0])}"${img ? ` style="background-image:url('${esc(img)}')"` : ''}></a>
    <div class="pk-main"><span class="tag">FREE SURVEY</span><h3>${esc((SURVEY[p.id] || [p.service])[0])}</h3>
      <div class="st-meta"><span>${icon('doc', 15)}${esc(p.fromLabel)}</span><span>${icon('calendar', 15)}We call you to arrange it</span></div></div>
    <div class="pk-side"><p class="muted st-blurb">${esc((SURVEY[p.id] || [0, p.blurb])[1])}</p>
      <a class="btn ghost sm st-survey" href="${href}">Request inspection${icon('arrow', 16)}</a></div></article>`;
};

const section = (p, topIn) => `<section class="st-sec" id="svc-${p.id}" data-sec="${p.id}">
    <h2>${esc(p.service)}${topIn ? `<span class="st-top">Most booked in ${esc(topIn)}</span>` : ''}</h2><p class="st-intro">${esc(p.intro || p.blurb)}</p>
    ${p.inspection ? surveyCard(p) : p.packages.map((pk) => pkgCard(p, pk)).join('')}
    ${site.services && site.services[p.id] ? `<a class="st-more" href="${p.id === 'amc' ? '/commercial' : '/services/' + site.services[p.id].slug}">Learn more about ${esc(p.id === 'amc' ? 'commercial pest control' : p.single)}${icon('right', 14)}</a>` : ''}
  </section>`;

// Each card: a small label, one big figure, one short supporting line, one button.
const offer = (cls, kicker, big, sub, btn, attr, img, imgCls = '') => `<article class="offer ${cls}"><div class="of-text"><span class="of-kicker">${kicker}</span><p class="of-big">${big}</p><p class="of-sub">${sub}</p><button class="of-btn" ${attr}>${btn}${icon('arrow', 15)}</button></div><span class="of-img ${imgCls}" style="background-image:url('${img}')"></span></article>`;
const offers = (cheapest) => [
  offer('offer-doctor', 'EXPRESS', `${site.fees.aboutMin} minutes`, 'Technician at your door', 'Book now', 'data-jump="list"', '/img/commercial-kitchen-inspection.webp'),
  offer('offer-green', 'PEST CONTROL', `<small>From</small> ${aed(pestById('general').from)}`, 'See your price first', 'Add to booking', 'data-add="general:apartment"', '/img/cockroach-gel-kitchen.webp'),
  offer('offer-dark', 'WARRANTY', '6 months', 'Unlimited call&#8209;outs', 'See services', 'data-jump="list"', '/img/termite-soil-treatment.webp'),
  offer('offer-light', 'PAY LATER', '4 instalments', 'Split it with Tabby', 'Book now', 'data-jump="list"', '/img/brand/tabby.png', 'of-tabby'),
].join('');

/* ---------- "Your booking" ---------- */
function cartHtml() {
  const p = S.draft.pest && pestById(S.draft.pest);
  const c = p && chosen(p);
  if (!c) {
    return `<h3 class="cart-h">Your booking</h3><div class="cart-empty"><span class="ic-circle">${icon('card', 22)}</span><b>No service added yet</b><span>Tap <b>Add</b> on any service to start.</span></div>`;
  }
  const fee = express() ? site.fees.expressNew : 0;
  return `<h3 class="cart-h">Your booking</h3>
    <div class="cart-item"><span class="ci-img" style="background-image:url('${esc(pestIcon(p.id))}')"></span>
      <div class="ci-text"><b>${esc(p.service)}</b><small>${esc(c.line)}</small>${p.packages.some((x) => x.sized) ? '<button class="link ci-change" data-change>Change home type or size</button>' : ''}</div><b class="ci-price">${aed(c.price)}</b>
      <button class="ci-x" data-remove aria-label="Remove">${icon('x', 16)}</button></div>
    <div class="cart-timing" role="radiogroup" aria-label="When do you need us?">
      <button role="radio" data-when="express" class="${express() ? 'on' : ''}" aria-checked="${express()}"><b>Express now</b><small>~${site.fees.aboutMin} min · +AED ${site.fees.expressNew}</small></button>
      <button role="radio" data-when="scheduled" class="${express() ? '' : 'on'}" aria-checked="${!express()}"><b>Schedule</b><small>From ${esc(site.firstDay)} · free</small></button>
    </div>
    <div class="cart-total"><span>Total incl. VAT</span><b>${aed(c.price + fee)}</b></div>
    <button class="btn cart-go" data-checkout>${S.area ? (express() ? 'Continue to payment' : 'Choose a time') : 'Choose your area to continue'}${icon('arrow', 18)}</button>
    <div class="cart-pay">${payLogos()}<small>${p.warrantyMonths ? `${wty(p)} included` : '2 visits, no warranty'}</small></div>`;
}
function barHtml() {
  const p = S.draft.pest && pestById(S.draft.pest);
  const c = p && chosen(p);
  if (!c) return `<a class="btn ghost cb-ico" href="${site.company.phoneHref}" aria-label="Call Akkad">${icon('phone', 20)}</a><button class="btn ghost cb-ico" data-chat aria-label="Chat with an agent">${icon('chat', 20)}</button><button class="btn" data-jump="list">Choose a service</button>`;
  const fee = express() ? site.fees.expressNew : 0;
  return `<button class="cb-x" data-remove aria-label="Remove ${esc(p.service)} from your booking">${icon('x', 18)}</button><button class="cb-sum" data-cart aria-label="See or change your booking"><b>${aed(c.price + fee)}<u>Change</u></b><small>${esc(p.short)} · ${esc(c.sz ? shortSize(c.pk.sized, c.sz.label) : c.line)}</small></button><button class="btn" data-checkout>${S.area ? 'Continue' : 'Choose area'}${icon('arrow', 17)}</button>`;
}

// Desktop: left and right arrows on a sideways row, plus click-and-drag, so a mouse can slide it like a finger does.
function arrows(track) {
  const make = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.arrow = dir < 0 ? 'prev' : 'next';
    b.className = 'row-arrow ' + (dir < 0 ? 'prev' : 'next');
    b.setAttribute('aria-label', dir < 0 ? 'Scroll back' : 'Scroll forward');
    b.innerHTML = '<span>' + icon(dir < 0 ? 'left' : 'right', 18) + '</span>';
    b.addEventListener('click', (e) => { e.stopPropagation(); track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.7), behavior: 'smooth' }); });
    return b;
  };
  const prev = make(-1), next = make(1);
  track.prepend(prev); track.append(next);
  const sync = () => { const max = track.scrollWidth - track.clientWidth; prev.hidden = track.scrollLeft < 8; next.hidden = max < 8 || track.scrollLeft > max - 8; };
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  // click-and-drag with a mouse
  let startX = null, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.row-arrow')) return; startX = e.clientX; startLeft = track.scrollLeft; moved = false; });
  const move = (e) => { if (startX == null) return; const dx = e.clientX - startX; if (Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); } if (moved) track.scrollLeft = startLeft - dx; };
  const end = () => { startX = null; setTimeout(() => track.classList.remove('dragging'), 0); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('resize', sync);
  onLeave(() => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('resize', sync); });
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  sync(); setTimeout(sync, 400);
}

/* ---------- the page ---------- */
// ctx: { area, stats, extraHtml } – area pages pass their area; the homepage passes the customer's area if known.
export function storePage(ctx = {}) {
  const c = site.company;
  const area = ctx.area || S.area;
  const place = ctx.area ? ctx.area.name : S.area ? S.area.short : 'UAE';
  // On an area page, the pest most booked there comes first.
  const list = ctx.top ? [pestById(ctx.top), ...site.pests.filter((p) => p.id !== ctx.top)] : site.pests;
  const cheapest = Math.min(...list.filter((p) => p.from).map((p) => p.from));
  const html = `
  <div class="wrap store">
    <div class="st-main">
      <section class="st-hero">
        <p class="eyebrow"><span class="live"></span>${area ? `Team near ${esc(area.short)} today` : 'Technicians available today'}</p>
        <h1>Pest Control in <span class="hl">${esc(place)}</span></h1>
        <div class="st-rating"><span class="rate-chip">★ ${c.rating}</span><a href="${c.mapsUrl || c.googleReviewsUrl}" target="_blank" rel="noopener">Google reviews ›</a>${ctx.stats ? `<span class="st-dot"></span><span>${ctx.stats.homes} homes treated in ${esc(area.short)}</span>` : ''}</div>
        <ul class="st-pills"><li>${icon('shield', 15)}<span class="desk">Municipality approved</span><span class="mob">Approved</span></li><li>${icon('calendar', 15)}<span class="desk">Up to 6-month warranty</span><span class="mob">6-month warranty</span></li><li>${icon('check', 15)}<span class="desk">Safe for kids and pets</span><span class="mob">Kid &amp; pet safe</span></li></ul>
      </section>

      <section class="card st-bugs"><h2>What's bugging you?</h2>
        <div class="bug-grid">${list.filter((p) => !p.commercial && !p.general).map(bugTile).join('')}<a class="bug bug-ask" href="/photos?mode=identify"><span class="bug-img">${icon('camera', 24)}</span><span>Not sure? Ask us</span></a></div>
      </section>

      <section class="st-offers"><div class="st-row-h"><h2>Offers and benefits</h2></div>
        <div class="offer-track">${offers(cheapest)}</div></section>

      <nav class="st-tabs" aria-label="Services">${list.map((p) => `<button data-jump="${p.id}" data-tab="${p.id}"><span style="background-image:url('${esc(pestIcon(p.id))}')"></span>${esc(p.short === 'Commercial' ? 'Commercial' : p.name)}</button>`).join('')}</nav>

      <div id="st-list">${list.map((p) => section(p, ctx.top === p.id ? area.short : '')).join('')}
      </div>

      <section class="st-block" id="how"><h2>How it works</h2>
        <div class="card how-card"><img class="how-img" src="/img/hero-pest-doctor.webp" alt="Hire your pest doctor in just 30 minutes, near you, anywhere in the UAE" width="1320" height="1200" loading="lazy">
          <div class="how-steps mob">${[['Pick your service', 'Choose the pest and home size'], ['Choose a time', 'Express today or any open slot'], ['We treat it', 'A trained technician, on time'], ['Stay protected', 'Pests back? We return free']].map(([t, d], i) => `<article class="offer how-step ${['offer-doctor', 'offer-green', 'offer-dark', 'offer-light'][i]}"><div class="of-text"><span class="of-kicker">STEP ${i + 1} OF 4</span><p class="of-big">${t}</p><p class="of-sub">${d}</p></div>${i < 3 ? `<span class="how-next" aria-hidden="true">${icon('arrow', 18)}</span>` : `<span class="how-next" aria-hidden="true">${icon('tick', 18)}</span>`}</article>`).join('')}</div>
          <ol class="st-how desk">${[['Pick your service', 'Choose the pest and your home size.'], ['Choose a time', 'Express today or any open slot.'], ['We treat it', 'A trained, uniformed technician arrives on time.'], ['Stay protected', 'Pests back during your warranty? We return free.']].map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol></div>
      </section>

      ${neighborsBlock(ctx, area)}

      <!-- the team card sits between the two review sections so they do not run together -->
      <section class="card st-team">
        ${photo('The Akkad Pest Control team and vans', '/img/akkad-team.jpg')}
        <div class="st-team-body"><span class="of-kicker green">MUNICIPALITY-APPROVED TEAM</span><h2>Trained experts, at your door</h2>
          <p class="muted">Uniformed technicians, approved products, and a clear report on WhatsApp after every visit.</p>
          <div class="st-stats"><div><b>${c.rating}★</b><small>Google rating</small></div><div><b>~${site.fees.aboutMin} min</b><small>Express arrival</small></div><div><b>6 mo</b><small>Max warranty</small></div><div><b>3</b><small>Emirates covered</small></div></div></div>
      </section>

      <section class="st-block" id="reviews">${googleBlock(ctx.googleReviews || site.googleReviews, area ? `Loved by families in ${esc(area.short)}` : 'Loved by families in the UAE')}</section>

      <section class="st-block" id="guide"><h2>Frequently asked questions</h2>
        <div class="card st-faq">${site.faq.map(([q, a], i) => `<details ${i ? '' : 'open'}><summary>${esc(q)}${icon('down', 18)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </section>

      <section class="st-help"><span class="sh-img" style="background-image:url('/img/cockroach-gel-kitchen.webp')"></span>
        <div class="sh-text"><h2>Need help choosing?</h2><p>Send us a photo of the pest. Our expert will recommend the right treatment in minutes.</p>
          <div class="sh-btns"><a class="btn sh-wa" href="${c.whatsapp}" target="_blank" rel="noopener">${icon('chat', 17)}WhatsApp us</a><a class="btn sh-call" href="${c.phoneHref}">${icon('phone', 17)}${esc(c.phone)}</a></div></div>
      </section>
    </div>

    ${bookingAside()}
  </div>
  ${bookingBar()}`;

  function mount(root) {
    mountBooking(root);
    $$('.offer-track, .st-tabs', root).forEach(arrows);


    // Jump to a service (pest tiles, tabs, offers).
    on(root, '[data-jump]', (b) => {
      const id = b.dataset.jump;
      const el = id === 'list' ? $('#st-list', root) : $('#svc-' + id, root);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 128, behavior: 'smooth' });
    });

    // Highlight the tab of the service in view.
    const tabs = $$('.st-tabs [data-tab]', root);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) tabs.forEach((t) => {
          const onNow = t.dataset.tab === e.target.dataset.sec;
          t.classList.toggle('on', onNow);
          if (onNow) t.parentNode.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
        });
      }), { rootMargin: '-140px 0px -60% 0px' });
      $$('.st-sec', root).forEach((s) => io.observe(s));
      onLeave(() => io.disconnect());
    }
  }
  return { html, mount };
}

/* ---------- the booking basket, shared by the shop and the service pages ---------- */
export const bookingAside = () => `<aside class="st-side"><div class="st-sticky">
      <div class="card cart" id="cart">${cartHtml()}</div>
      <ul class="card st-why">
        <li>${icon('shield', 17)}<span><b>Municipality approved.</b> Licensed by Dubai Municipality.</span></li>
        <li>${icon('check', 17)}<span><b>Family-safe.</b> Safe for kids and pets.</span></li>
        <li>${icon('card', 17)}<span><b>Clear pricing.</b> The price you see is the price you pay.</span></li>
        <li>${icon('calendar', 17)}<span><b>Warranty cover.</b> Free re-visits if pests return.</span></li>
      </ul>
    </div></aside>`;
export const bookingBar = () => `<div class="cart-bar" id="cartbar">${barHtml()}</div>`;

// Wires Add, View details, remove, express/schedule and Continue inside root.
export function mountBooking(root) {
  document.body.classList.add('store-on');
  onLeave(() => document.body.classList.remove('store-on'));
  const refresh = () => { const c = $('#cart', root), b = $('#cartbar', root); if (c) c.innerHTML = cartHtml(); if (b) b.innerHTML = barHtml(); };
  const add = (pestId, pkgId) => {
    const p = pestById(pestId);
    const pk = p.packages.find((x) => x.id === pkgId);
    if (!pk.sized) { setDraft({ pest: p.id, pkg: pk.id, size: null }); refresh(); toast(`${p.service} added`); return; }
    sizePicker(p, pk.id, () => { refresh(); toast(`${p.service} added`); });
  };
  on(root, '[data-add]', (b) => { const [pe, pk] = b.dataset.add.split(':'); add(pe, pk); });
  on(root, '[data-info]', (b) => { const [pe, pk] = b.dataset.info.split(':'); details(pestById(pe), pk, () => add(pe, pk)); });
  const clear = () => { setDraft({ pest: null, pkg: null, size: null, mattresses: null }); refresh(); toast('Removed from your booking'); };
  const change = (after) => {
    const p = pestById(S.draft.pest);
    const pk = p.packages.find((x) => x.id === S.draft.pkg);
    sizePicker(p, pk && pk.sized ? pk.id : p.packages.find((x) => x.sized).id, () => { refresh(); if (after) after(); });
  };
  const checkout = () => (S.area ? go(`/book/${S.draft.pest}/${express() ? 'pay' : 'time'}`) : checkAvailability());
  // Phone: the whole booking in one sheet, so the customer can see it, change it, remove it or continue.
  const cartSheet = () => {
    if (!(S.draft.pest && chosen(pestById(S.draft.pest)))) return;
    openLayer('sheet', `<div class="cart-sheet">${cartHtml()}</div>`, { mount(box) {
      on(box, '[data-when]', (b) => { setDraft({ timing: b.dataset.when }); refresh(); cartSheet(); });
      on(box, '[data-remove]', () => { closeLayer(); clear(); });
      on(box, '[data-change]', () => change(cartSheet));
      on(box, '[data-checkout]', checkout);
    } });
  };
  on(root, '[data-remove]', clear);
  on(root, '[data-change]', () => change());
  on(root, '[data-cart]', cartSheet);
  on(root, '[data-when]', (b) => { setDraft({ timing: b.dataset.when }); refresh(); });
  on(root, '[data-checkout]', (btn) => {
    if (!S.area) return checkAvailability();
    if (btn.closest('#cartbar')) return cartSheet(); // phone: review the booking and pick the time first
    checkout();
  });
}

/* ---------- home size picker ---------- */
function sizePicker(p, pkgId, done) {
  setDraft({ pest: p.id, pkg: pkgId });
  const paint = () => {
    const pk = p.packages.find((x) => x.id === S.draft.pkg);
    const type = pk.sized;
    ensureSize(p, pk);
    const sizedPkgs = p.packages.filter((x) => x.sized);
    const c = chosen(p);
    openLayer('sheet', `
      <h2 class="plain">${esc(p.service)}</h2>
      ${pkPhoto(p, pk) ? `<div class="pk-photo" style="background-image:url('${esc(pkPhoto(p, pk))}')" role="img" aria-label="${esc(pk.title)}"></div>` : ''}
      
      ${sizedPkgs.length > 1 ? `<div class="seg">${sizedPkgs.map((x) => `<button data-seg="${x.id}" class="${x.id === pk.id ? 'on' : ''}">${x.sized === 'villa' ? 'Villa' : 'Apartment'}</button>`).join('')}</div>` : ''}
      ${sizeControls(p, pk)}
      <div class="sz-facts"><span>${icon('shield', 16)}${wty(p)}</span><span>${icon('calendar', 16)}${esc(pk.duration)}</span><span>${icon('check', 16)}VAT included</span></div>
      <div class="sz-more">
        <details><summary>What's included${icon('down', 18)}</summary><ul class="st-inc">${pk.points.map((t) => `<li>${icon('check', 16)}${esc(t)}</li>`).join('')}</ul></details>
        <details open><summary>What the technician does${icon('down', 18)}</summary>${stepsHtml(p.steps, p.id)}</details>
        <details><summary>Before and after the visit${icon('down', 18)}</summary><p class="muted"><b>Before:</b> ${esc(p.prep)}</p>${p.after ? `<p class="muted"><b>After:</b> ${esc(p.after)}</p>` : ''}</details>
      </div>
      <div class="sz-foot"><button class="btn" data-done>Add · ${aed(c.price)}</button></div>`, {
      mount(box) {
        on(box, '[data-seg]', (b) => { setDraft({ pkg: b.dataset.seg }); paint(); });
        wireSizeControls(box, p, () => {
          const y = box.scrollTop, open = [...box.querySelectorAll('.sz-more details')].map((d) => d.open);
          paint();
          const fresh = $('#layer .box');
          [...fresh.querySelectorAll('.sz-more details')].forEach((d, k) => { d.open = !!open[k]; });
          fresh.scrollTop = y;
        });
        on(box, '[data-done]', () => { closeLayer(); done(); });
      },
    });
  };
  paint();
}

/* ---------- package details ---------- */
function details(p, pkgId, add) {
  const pk = p.packages.find((x) => x.id === pkgId);
  openLayer('popup', `<div class="explain"><h2 class="plain">${esc(pk.title)}</h2>${pkPhoto(p, pk) ? `<div class="pk-photo" style="background-image:url('${esc(pkPhoto(p, pk))}')" role="img" aria-label="${esc(pk.title)}"></div>` : ''}
    <p class="muted">${esc(p.intro)}</p>
    <h4>Included</h4><ul class="st-inc">${pk.points.map((t) => `<li>${icon('check', 16)}${esc(t)}</li>`).join('')}${p.warrantyMonths ? `<li>${icon('shield', 16)}${wty(p)}</li>` : ''}</ul>
    <h4>What the technician will do</h4>${stepsHtml(p.steps, p.id)}
    <h4>Before we arrive</h4><p class="muted">${esc(p.prep)}</p>
    ${p.after ? `<h4>After the visit</h4><p class="muted">${esc(p.after)}</p>` : ''}
    <button class="btn" style="margin-top:16px" data-ok>Add · ${pk.sized ? 'from ' : ''}${aed(fromOf(p, pk))}</button></div>`,
  { mount(box) { on(box, '[data-ok]', () => { closeLayer(); add(); }); } });
}
