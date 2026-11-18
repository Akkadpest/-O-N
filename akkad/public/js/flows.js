// Pop-ups that connect the pages: location, nearby team, new or warranty, booking help.
import { S, save, site, me, api, go, esc, icon, openLayer, closeLayer, on, $ } from './core.js';

export const areaUrl = (a = S.area) => `/pest-control/${a.slug}`;
const seen = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const mark = (k) => { try { sessionStorage.setItem(k, '1'); } catch { /* ignore */ } };

/* Screens 13-15: Check availability finds the area in the same pop-up. */
let locating = 0;
export function checkAvailability() {
  if (S.area) return go(areaUrl());
  if (!navigator.geolocation) return go('/area');
  const mine = ++locating;
  const box = openLayer('popup', `
    <div class="kicker"><span class="live"></span>Checking who's near you</div>
    <h2>Finding technicians near you</h2>
    <p>Your browser will ask to share your location. Tap <b>Allow</b> and we will find your area automatically.</p>
    <div class="updating"><span class="spin"></span>Waiting for your location…</div>
    <p class="center"><button class="link" data-manual>Enter my area instead</button></p>`, { onClose: () => { locating++; } });
  on(box, '[data-manual]', () => { locating++; go('/area'); });
  navigator.geolocation.getCurrentPosition(async (pos) => {
    if (mine !== locating) return;
    try {
      const { area } = await api(`/areas/near?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      if (mine !== locating) return;
      if (area) foundPopup(area); else go('/area?far=1');
    } catch { if (mine === locating) go('/area'); }
  }, () => { if (mine === locating) go('/area'); }, { timeout: 12000, maximumAge: 600000 });
}

export function foundPopup(area) {
  const box = openLayer('popup', `
    <div class="kicker"><span class="live"></span>Location found</div>
    <p class="muted">We found you in</p>
    <h2 class="ic-row" style="gap:10px">${icon('pin', 30)}<span>${esc(area.name)}</span></h2>
    <p>Technicians are working near you today.</p>
    <div class="row"><button class="btn" data-yes style="flex:2.3">Yes, this is my area</button><button class="btn ghost" data-change>Change</button></div>`);
  on(box, '[data-yes]', () => { S.area = area; save(); go(areaUrl(area)); });
  on(box, '[data-change]', () => go('/area'));
}

/* Screen 19: nearby team. Express now or schedule later, chosen before any price. */
export function teamPopup() {
  if (!S.area) return checkAvailability();
  mark('team:' + S.area.slug);
  const f = site.fees;
  const box = openLayer('sheet', `
    <div class="kicker"><span class="live"></span>Team available near ${esc(S.area.short)}</div>
    <h2>A technician can reach you in about ${f.aboutMin} min</h2>
    <div class="teamline"><span class="rail"></span><span class="fill"></span><i class="a"></i><i class="v">${icon('truck', 22)}</i><i class="z">${icon('pin', 20)}</i></div>
    <div class="teamline-l"><span>Akkad team</span><span>about ${f.aboutMin} min</span><span>You</span></div>
    <button class="btn lg" data-t="express">Book nearby team</button>
    <p class="note center">Express fee: AED ${f.expressNew} new booking · AED ${f.expressWarranty} warranty visit</p>
    <button class="btn ghost" data-t="scheduled">Schedule for later <span class="muted">· no extra fee</span></button>
    <p class="note center">Team status updated ${esc(site.statusClock)}</p>`);
  on(box, '[data-t]', (b) => { S.draft = { ...S.draft, timing: b.dataset.t }; save(); needPopup(); });
}
export const teamSeen = () => S.area && seen('team:' + S.area.slug);

/* Screen 20: new customer or warranty. */
export function needPopup() {
  const express = S.draft.timing !== 'scheduled';
  const box = openLayer('sheet', `
    <span class="pill lg">${icon(express ? 'check' : 'calendar', 20)}${express ? 'Nearby team selected' : 'Scheduled visit · no extra fee'}</span>
    <h2>What do you need today?</h2>
    <button class="card on ic-row" data-n="new">${icon('bug', 34)}<span class="grow"><h3>New pest problem</h3><p class="sub">Get a price for a new treatment</p></span></button>
    <button class="card ic-row" data-n="warranty">${icon('shield', 34)}<span class="grow"><h3>I have a warranty</h3><p class="sub">Free call-out with your booking number</p></span></button>
    <p class="center"><button class="link" data-n="booked">Already booked? Reschedule or track</button></p>`);
  on(box, '[data-n]', (b) => {
    const n = b.dataset.n;
    if (n === 'new') go('/book');
    else if (n === 'warranty') go('/warranty');
    else afterSales();
  });
}

/* Screen 55: every after-sales action in one place. */
export function afterSales() {
  const b = me.upcoming[0];
  if (!b) return go(me.warranties.length || me.past.length ? '/my-bookings' : '/find');
  const row = (ic, title, sub, href, cls = '') => `<a class="card ic-row ${cls}" href="${href}" style="text-decoration:none">${icon(ic, 30)}<span class="grow"><h3>${title}</h3><p class="sub">${sub}</p></span>${icon('right', 20)}</a>`;
  const w = me.warranties[0] || me.past.find((p) => p.warrantyActive);
  openLayer('sheet', `
    <h2>How can we help with your booking?</h2>
    <div class="pill lg line" style="display:flex">${icon('calendar', 20)}<b>${esc(b.id)} · ${esc(b.when)}</b></div>
    ${row('calendar', 'Reschedule my visit', 'Free, any time before the technician sets off', `/booking/${b.id}/reschedule`, 'on')}
    ${row('truck', 'Track my technician', 'Live on the day of your visit', `/booking/${b.id}/track`)}
    ${row('shield', 'Pests came back?', 'Book a free warranty visit', w ? `/warranty/${w.id}` : '/warranty')}
    ${row('info', 'Warranty and service reports', 'Dates, reports and receipts', '/my-bookings')}
    <p class="center"><a class="link" href="/find">Not your booking? Use another number</a></p>`);
}
export const warrantyEntry = () => (me.upcoming.length ? afterSales() : go(me.warranties[0] ? `/warranty/${me.warranties[0].id}` : '/warranty'));

/* The Book button: on every screen. */
export function book() {
  if (!S.area) return checkAvailability();
  teamPopup();
}

/* Screens 1 and 52: the first pop-up depends on what we know about the customer. */
export function homePopup() {
  if (seen('home-popup')) return;
  mark('home-popup');
  const up = me.upcoming[0], w = me.warranties[0], old = me.ended[0];
  let html, mount;
  if (up) {
    html = `<div class="kicker">${icon('check', 20)}Welcome back</div>
      <h2>${up.tracking ? 'Your technician is on the way' : `Your visit is on ${esc(up.when)}`}</h2>
      <p class="muted">${esc(up.kind === 'warranty' ? 'Warranty visit' : up.service)} · Booking ${esc(up.id)}</p>
      ${up.tracking ? `<a class="btn lg" href="/booking/${up.id}/track">${icon('truck', 22)}Track my technician</a>` : `<a class="btn lg" href="/booking/${up.id}/reschedule">${icon('calendar', 22)}Reschedule</a>`}
      <div class="row"><a class="btn ghost" href="/booking/${up.id}">View my booking</a><a class="btn ghost" href="${site.company.phoneHref}">Call us</a></div>
      <p class="center"><button class="link" data-new>Book a new service instead</button></p>`;
  } else if (w) {
    html = `<div class="kicker">${icon('shield', 20)}Welcome back</div>
      <h2>Pests came back? Your warranty is active</h2>
      <p class="muted">${esc(w.service)} · covered until ${esc(w.warrantyUntilLabel)}</p>
      <a class="btn lg" href="/warranty/${w.id}">Book a free warranty visit</a>
      <div class="row"><a class="btn ghost" href="/my-bookings">My bookings</a><a class="btn ghost" href="${site.company.phoneHref}">Call us</a></div>
      <p class="center"><button class="link" data-new>Book a new service instead</button></p>`;
  } else if (old) {
    html = `<div class="kicker">${icon('calendar', 20)}Welcome back</div>
      <h2>Time for your next treatment</h2>
      <p class="muted">Your ${esc(old.service.toLowerCase())} warranty ended on ${esc(old.warrantyUntilLabel)}.</p>
      <button class="btn lg" data-again="${esc(old.pest)}">Book again</button>
      <div class="row"><a class="btn ghost" href="/my-bookings">My bookings</a><a class="btn ghost" href="${site.company.phoneHref}">Call us</a></div>`;
  } else {
    html = `<div class="kicker"><span class="live"></span>Technicians available today</div>
      <h2>Check who's near you</h2>
      <p>See pests treated nearby, local reviews and available technicians.</p>
      <button class="btn lg" data-check><span class="live"></span>Check availability</button>
      <p class="note center">Takes 5 seconds</p>
      <p class="center"><a class="link" href="/area">Enter my area instead</a></p>`;
  }
  mount = (box) => {
    on(box, '[data-check]', () => checkAvailability());
    on(box, '[data-new]', () => { closeLayer(); book(); });
    on(box, '[data-again]', (b) => { S.draft = { timing: 'scheduled' }; save(); go(S.area ? `/book/${b.dataset.again}` : '/area'); });
  };
  openLayer('popup', html, { mount });
}
