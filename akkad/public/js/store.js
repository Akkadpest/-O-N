// The booking shop: one page used by the homepage and by every area page.
// The customer picks a service, adds it to "Your booking" and continues to time and payment.
// Same page for everyone, personalised by the customer's area (S.area) or by the area page it is on.
import { S, save, site, go, esc, icon, aed, photo, imgFor, pestImg, stars, sliderHtml, on, $, $$, openLayer, closeLayer, toast, onLeave, payLogos } from './core.js';
import { checkAvailability } from './flows.js';
import { chosen, shortSize } from './pages-book.js';

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
  const pests = [...new Set(list.map((r) => r.pest))].filter((p) => p !== top);
  const filters = [...(top ? [[top, pestName(top)]] : []), ['', 'All pests'], ...pests.map((p) => [p, pestName(p)])];
  const where = ctx.area ? area.short : '';
  return `<section class="st-block" id="neighbors" data-first="${top}">
    <h2>${where ? `What your neighbours in ${esc(where)} say about Akkad` : 'What your neighbours say about Akkad'}</h2>
    <p class="rev-score"><b>${ctx.stats ? ctx.stats.rating : site.company.rating}</b>${stars(5)}<span>${ctx.stats ? `from ${ctx.stats.homes} verified Akkad jobs in ${esc(where)}` : 'from verified Akkad jobs'}</span></p>
    <div class="chips" id="filters">${filters.map(([id, n], i) => `<button class="chip ${i ? '' : 'on'}" data-f="${id}">${esc(n)}</button>`).join('')}</div>
    ${sliderHtml(list.map((r) => jobCard(r, ctx.area ? area : null)))}</section>`;
}

/* ---------- pieces of the page ---------- */
const bugTile = (p) => `<button class="bug" data-jump="${p.id}"><span class="bug-img" style="background-image:url('${esc(pestIcon(p.id))}')"></span><span>${esc(p.name)}</span></button>`;

export const pkgCard = (p, pk) => {
  const options = pk.sized ? p.sizes[pk.sized].length : 0;
  return `<article class="card pkg st-pkg"><div>${pk.badge ? `<span class="tag">${esc(pk.badge)}</span>` : ''}<h3>${esc(pk.title)}</h3>
    <div class="st-meta"><span>${icon('shield', 15)}${p.warrantyMonths}-month warranty</span><span>${icon('calendar', 15)}${esc(pk.duration)}</span></div>
    <div class="price">${pk.sized ? '<small>Starts at</small> ' : ''}${aed(fromOf(p, pk))}</div>
    <ul>${pk.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <button class="link b" data-info="${p.id}:${pk.id}">View details ›</button></div>
    <div class="side">${photo(pk.photo, imgFor(pk.photo) || imgFor(p.photo))}<button class="btn add" data-add="${p.id}:${pk.id}" aria-label="Add ${esc(pk.title)}">Add</button>${options ? `<small class="opts">${options} sizes</small>` : ''}</div></article>`;
};

// Inspection-first services: what the survey is, in plain words.
const SURVEY = {
  termites: ['Termite inspection and treatment plan', 'A specialist checks walls, floors and door frames, then gives you a fixed price before any work starts.'],
  amc: ['Annual contract for your business', 'Scheduled visits, service reports for your inspections, and call-outs included. Restaurants, offices, buildings and warehouses.'],
};
export const surveyCard = (p) => `<article class="card pkg st-pkg"><div><span class="tag">FREE SURVEY</span><h3>${esc((SURVEY[p.id] || [p.service])[0])}</h3>
    <div class="st-meta"><span>${icon('doc', 15)}${esc(p.fromLabel)}</span><span>${icon('calendar', 15)}We call you to arrange it</span></div>
    <p class="muted st-blurb">${esc((SURVEY[p.id] || [0, p.blurb])[1])}</p>
    <a class="btn ghost sm st-survey" href="/inspection?job=${p.commercial ? 'amc' : 'termite'}">Request inspection${icon('arrow', 16)}</a></div>
    <div class="side">${photo(p.photo)}</div></article>`;

const section = (p, topIn) => `<section class="st-sec" id="svc-${p.id}" data-sec="${p.id}">
    <h2>${esc(p.service)}${topIn ? `<span class="st-top">Most booked in ${esc(topIn)}</span>` : ''}</h2><p class="st-intro">${esc(p.intro || p.blurb)}</p>
    ${p.inspection ? surveyCard(p) : p.packages.map((pk) => pkgCard(p, pk)).join('')}
    ${site.services && site.services[p.id] ? `<a class="st-more" href="${p.id === 'amc' ? '/commercial' : '/services/' + site.services[p.id].slug}">Learn more about ${esc(p.id === 'amc' ? 'commercial pest control' : p.single)}${icon('right', 14)}</a>` : ''}
  </section>`;

const offers = (cheapest) => [
  `<article class="offer offer-doctor"><div class="of-text"><span class="of-kicker">EXPRESS</span><p>${site.fees.aboutMin} min arrival</p><button class="of-btn" data-jump="list">Book now${icon('arrow', 15)}</button></div><span class="of-img" style="background-image:url('/img/commercial-kitchen-inspection.webp')"></span></article>`,
  `<article class="offer offer-green"><div class="of-text"><span class="of-kicker">FROM</span><p>General pest control AED ${cheapest}</p><button class="of-btn" data-add="cockroach:kitchen">Add to booking${icon('arrow', 15)}</button></div><span class="of-img" style="background-image:url('/img/cockroach-gel-kitchen.webp')"></span></article>`,
  `<article class="offer offer-dark"><div class="of-text"><span class="of-kicker">PEACE OF MIND</span><p>6 months warranty + unlimited callouts</p><button class="of-btn" data-jump="list">See services${icon('arrow', 15)}</button></div><span class="of-img" style="background-image:url('/img/termite-soil-treatment.webp')"></span></article>`,
  `<article class="offer offer-light"><div class="of-text"><span class="of-kicker">PAY LATER</span><p>Pay with instalments</p><button class="of-btn" data-jump="list">Choose a service${icon('arrow', 15)}</button></div><span class="of-img of-tabby" style="background-image:url('/img/brand/tabby.png')"></span></article>`,
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
      <div class="ci-text"><b>${esc(p.service)}</b><small>${esc(c.line)}</small></div><b class="ci-price">${aed(c.price)}</b>
      <button class="ci-x" data-remove aria-label="Remove">${icon('x', 16)}</button></div>
    <div class="cart-timing" role="radiogroup" aria-label="When do you need us?">
      <button role="radio" data-when="express" class="${express() ? 'on' : ''}" aria-checked="${express()}"><b>Express now</b><small>~${site.fees.aboutMin} min · +AED ${site.fees.expressNew}</small></button>
      <button role="radio" data-when="scheduled" class="${express() ? '' : 'on'}" aria-checked="${!express()}"><b>Schedule</b><small>From ${esc(site.firstDay)} · free</small></button>
    </div>
    <div class="cart-total"><span>Total incl. VAT</span><b>${aed(c.price + fee)}</b></div>
    <button class="btn cart-go" data-checkout>${S.area ? (express() ? 'Continue to payment' : 'Choose a time') : 'Choose your area to continue'}${icon('arrow', 18)}</button>
    <div class="cart-pay">${payLogos()}<small>${p.warrantyMonths}-month warranty included</small></div>`;
}
function barHtml() {
  const p = S.draft.pest && pestById(S.draft.pest);
  const c = p && chosen(p);
  if (!c) return `<a class="btn ghost cb-ico" href="${site.company.phoneHref}" aria-label="Call Akkad">${icon('phone', 20)}</a><button class="btn ghost cb-ico" data-chat aria-label="Chat with an agent">${icon('chat', 20)}</button><button class="btn" data-jump="list">Choose a service</button>`;
  const fee = express() ? site.fees.expressNew : 0;
  return `<div class="cb-sum"><b>${aed(c.price + fee)}</b><small>${esc(p.service)} · ${esc(c.line)}</small></div><button class="btn" data-checkout>${S.area ? 'Continue' : 'Choose area'}${icon('arrow', 17)}</button>`;
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
        <div class="bug-grid">${list.filter((p) => !p.commercial).map(bugTile).join('')}<a class="bug bug-ask" href="/photos?mode=identify"><span class="bug-img">${icon('camera', 24)}</span><span>Not sure? Ask us</span></a></div>
      </section>

      <section class="st-offers"><div class="st-row-h"><h2>Offers and benefits</h2></div>
        <div class="offer-track">${offers(cheapest)}</div></section>

      <nav class="st-tabs" aria-label="Services">${list.map((p) => `<button data-jump="${p.id}" data-tab="${p.id}"><span style="background-image:url('${esc(pestIcon(p.id))}')"></span>${esc(p.short === 'Commercial' ? 'Commercial' : p.name)}</button>`).join('')}</nav>

      <div id="st-list">${list.map((p) => section(p, ctx.top === p.id ? area.short : '')).join('')}
      </div>

      <section class="st-block" id="how"><h2>How it works</h2>
        <ol class="card st-how">${[['Pick your service', 'Choose the pest and your home size.'], ['Choose a time', 'Express today or any open slot.'], ['We treat it', 'A trained, uniformed technician arrives on time.'], ['Stay protected', 'Pests back during your warranty? We return free.']].map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol>
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

    // Neighbour reviews: filter by pest.
    on(root, '[data-f]', (b) => {
      $$('#filters .chip', root).forEach((c) => c.classList.toggle('on', c === b));
      $$('.rev.job', root).forEach((c) => { c.hidden = !!b.dataset.f && c.dataset.pest !== b.dataset.f; });
      const tr = $('#neighbors .track', root); if (tr) { tr.scrollLeft = 0; tr.dispatchEvent(new Event('scroll')); }
    });
    const first = $('#filters .chip', root); if (first) first.click();

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
  on(root, '[data-remove]', () => { setDraft({ pest: null, pkg: null, size: null }); refresh(); });
  on(root, '[data-when]', (b) => { setDraft({ timing: b.dataset.when }); refresh(); });
  on(root, '[data-checkout]', (btn) => {
    if (!S.area) return checkAvailability();
    // On phones the cart panel (with the Express / Schedule switch) is hidden, so ask here.
    if (btn.closest('#cartbar')) return whenSheet();
    go(`/book/${S.draft.pest}/${express() ? 'pay' : 'time'}`);
  });
}

/* ---------- phone: express now or schedule, chosen before the price is paid ---------- */
function whenSheet() {
  const p = pestById(S.draft.pest);
  const c = p && chosen(p);
  if (!c) return;
  const f = site.fees;
  openLayer('sheet', `<h2 class="plain">When do you need us?</h2>
    <p class="muted">${esc(p.service)} · ${esc(c.line)} · ${aed(c.price)}</p>
    <button class="card ic-row ${express() ? 'on' : ''}" data-go="express">${icon('truck', 28)}<span class="grow"><h3>Express now</h3><p class="sub">About ${f.aboutMin} min · +${aed(f.expressNew)}</p></span><b>${aed(c.price + f.expressNew)}</b></button>
    <button class="card ic-row ${express() ? '' : 'on'}" data-go="scheduled">${icon('calendar', 28)}<span class="grow"><h3>Schedule a visit</h3><p class="sub">From ${esc(site.firstDay)} · free</p></span><b>${aed(c.price)}</b></button>`, {
    mount(box) { on(box, '[data-go]', (b) => { setDraft({ timing: b.dataset.go }); go(`/book/${p.id}/${b.dataset.go === 'express' ? 'pay' : 'time'}`); }); },
  });
}

/* ---------- home size picker ---------- */
function sizePicker(p, pkgId, done) {
  setDraft({ pest: p.id, pkg: pkgId });
  const paint = () => {
    const pk = p.packages.find((x) => x.id === S.draft.pkg);
    const type = pk.sized;
    const list = p.sizes[type];
    if (!list.some((s) => s.id === S.draft.size) || S.draft.sizeType !== type) setDraft({ size: list[type === 'villa' ? 2 : 1].id, sizeType: type });
    const sizedPkgs = p.packages.filter((x) => x.sized);
    const c = chosen(p);
    openLayer('sheet', `
      <h2 class="plain">${esc(p.service)}</h2>
      <p class="muted">Choose your home size. Price includes VAT and a ${p.warrantyMonths}-month warranty.</p>
      ${sizedPkgs.length > 1 ? `<div class="seg">${sizedPkgs.map((x) => `<button data-seg="${x.id}" class="${x.id === pk.id ? 'on' : ''}">${x.sized === 'villa' ? 'Villa' : 'Apartment'}</button>`).join('')}</div>` : ''}
      <div class="sizes" role="radiogroup">${list.map((s) => `<label><input type="radio" name="size" value="${s.id}" ${s.id === S.draft.size ? 'checked' : ''}>${esc(s.label)}<b>${aed(s.price)}</b></label>`).join('')}</div>
      <button class="btn" data-done>Add ${esc(shortSize(type, list.find((s) => s.id === S.draft.size).label))} · ${aed(c.price)}</button>`, {
      mount(box) {
        on(box, '[data-seg]', (b) => { setDraft({ pkg: b.dataset.seg }); paint(); });
        on(box, 'input[name=size]', (i) => { setDraft({ size: i.value }); paint(); }, 'change');
        on(box, '[data-done]', () => { closeLayer(); done(); });
      },
    });
  };
  paint();
}

/* ---------- package details ---------- */
function details(p, pkgId, add) {
  const pk = p.packages.find((x) => x.id === pkgId);
  openLayer('popup', `<div class="explain"><h2 class="plain">${esc(pk.title)}</h2>
    <p class="muted">${esc(p.intro)}</p>
    <h4>Included</h4><ul class="st-inc">${pk.points.map((t) => `<li>${icon('check', 16)}${esc(t)}</li>`).join('')}<li>${icon('shield', 16)}${p.warrantyMonths}-month warranty</li></ul>
    <h4>What the technician will do</h4>${p.steps.map(([t, d], i) => `<div class="do"><span class="num">${i + 1}</span><div><b>${esc(t)}</b><span>${esc(d)}</span></div></div>`).join('')}
    <h4>Before we arrive</h4><p class="muted">${esc(p.prep)}</p>
    <button class="btn" style="margin-top:16px" data-ok>Add · ${pk.sized ? 'from ' : ''}${aed(fromOf(p, pk))}</button></div>`,
  { mount(box) { on(box, '[data-ok]', () => { closeLayer(); add(); }); } });
}
