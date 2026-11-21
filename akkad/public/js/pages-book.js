// New booking (screens 21-32) and warranty call-out (screens 37-40).
import { S, save, site, me, api, route, go, esc, icon, aed, wty, cover, stepsHtml, photo, imgFor, pestTile, helpBox, payLogos, lines, on, $, $$, busy, showErr, openLayer, closeLayer, remember, loadMe } from './core.js';
import { areaUrl } from './flows.js';

const needArea = () => { if (!S.area) { go('/area', { replace: true }); return true; } return false; };
const pestOf = (id) => site.pests.find((p) => p.id === id && !p.inspection);
const setDraft = (patch) => { S.draft = { ...S.draft, ...patch }; save(); };
const express = () => S.draft.timing !== 'scheduled';
export const shortSize = (type, label) => {
  const home = type === 'villa' ? 'villa' : 'apt';
  if (label === 'Studio') return 'studio';
  if (/^\d+ bedrooms?$/.test(label)) return label.replace(/ bedrooms?/, '-bed') + ' ' + home;
  return `${home === 'apt' ? 'apartment' : 'villa'}, ${label.charAt(0).toLowerCase() + label.slice(1)}`;
};

// What the customer has chosen so far, priced. The server prices it again on booking.
export function chosen(p) {
  const pk = p.packages.find((x) => x.id === S.draft.pkg);
  if (!pk) return null;
  if (!pk.sized) return { pk, price: pk.price, label: pk.label, line: pk.title.split(': ')[1].replace(/^./, (c) => c.toUpperCase()) };
  const sz = p.sizes[pk.sized].find((s) => s.id === S.draft.size);
  if (!sz) return null;
  const home = pk.sized === 'villa' ? 'Villa' : 'Apartment';
  // Some packages add a price per mattress on top of the home size (bed bugs in villas).
  const mattresses = pk.perMattress ? Math.min(site.maxMattresses, Math.max(1, Number(S.draft.mattresses) || Math.max(1, sz.beds || 1))) : 0;
  const extra = mattresses * (pk.perMattress || 0);
  return { pk, sz, mattresses, base: sz.price, extra, price: sz.price + extra,
    label: `${p.service} · ${shortSize(pk.sized, sz.label)}${mattresses ? ` · ${mattresses} mattress${mattresses > 1 ? 'es' : ''}` : ''}`,
    line: `${home}, ${sz.label.charAt(0).toLowerCase() + sz.label.slice(1)}${mattresses ? `, ${mattresses} mattress${mattresses > 1 ? 'es' : ''}` : ''}` };
}

// Makes sure a valid size is selected for the package (1 bedroom for apartments, 3 for villas to start).
export function ensureSize(p, pk) {
  const list = p.sizes[pk.sized];
  if (!list.some((s) => s.id === S.draft.size) || S.draft.sizeType !== pk.sized) {
    setDraft({ size: (list.find((s) => s.beds === (pk.sized === 'villa' ? 3 : 1)) || list[0]).id, sizeType: pk.sized, mattresses: null });
  }
}
// The size controls: count bedrooms up and down and watch the price change.
export function sizeControls(p, pk) {
  const list = p.sizes[pk.sized];
  const withBeds = list.filter((s) => s.beds != null).sort((a, b) => a.beds - b.beds);
  const others = list.filter((s) => s.beds == null);
  const c = chosen(p);
  const i = withBeds.indexOf(c.sz);
  const bedText = (s) => (s.beds === 0 ? 'Studio' : String(s.beds));
  const stepper = (label, hint, value, key, canDown, canUp) => `<div class="stp-row"><div class="stp-label"><b>${label}</b><small>${hint}</small></div>
    <div class="stp"><button type="button" data-step="${key}:-1" ${canDown ? '' : 'disabled'} aria-label="Fewer ${label.toLowerCase()}">−</button><output aria-live="polite">${value}</output><button type="button" data-step="${key}:1" ${canUp ? '' : 'disabled'} aria-label="More ${label.toLowerCase()}">+</button></div></div>`;
  return `<div class="size-box">
    ${stepper('Bedrooms', `${bedText(withBeds[0])}${withBeds[0].beds === 0 ? '' : ' bedroom'} to ${withBeds[withBeds.length - 1].beds} bedrooms`, i < 0 ? '–' : bedText(c.sz), 'beds', i > 0, i < withBeds.length - 1)}
    ${pk.perMattress ? stepper('Mattresses', `${aed(pk.perMattress)} each`, c.mattresses, 'mat', c.mattresses > 1, c.mattresses < site.maxMattresses) : ''}
    ${others.length ? `<div class="size-other"><small>Or choose</small>${others.map((s) => `<label><input type="radio" name="size" value="${s.id}" ${s.id === c.sz.id ? 'checked' : ''}><span>${esc(s.label)}</span><b>${aed(s.price)}</b></label>`).join('')}</div>` : ''}
    <div class="size-sum">
      <div><span>${esc(pk.sized === 'villa' ? 'Villa' : 'Apartment')}, ${esc(c.sz.label.charAt(0).toLowerCase() + c.sz.label.slice(1))}${c.sz.note ? ` <small>(${esc(c.sz.note)})</small>` : ''}</span><b>${aed(c.base)}</b></div>
      ${pk.perMattress ? `<div><span>${c.mattresses} mattress${c.mattresses > 1 ? 'es' : ''} × ${aed(pk.perMattress)}</span><b>${aed(c.extra)}</b></div><div class="size-total"><span>Price</span><b>${aed(c.price)}</b></div>` : ''}
    </div></div>`;
}
export function wireSizeControls(box, p, repaint) {
  on(box, '[data-step]', (b) => {
    const [key, d] = b.dataset.step.split(':');
    const pk = p.packages.find((x) => x.id === S.draft.pkg);
    const c = chosen(p);
    if (key === 'mat') setDraft({ mattresses: c.mattresses + Number(d) });
    else {
      const withBeds = p.sizes[pk.sized].filter((s) => s.beds != null).sort((a, b) => a.beds - b.beds);
      const i = withBeds.indexOf(c.sz);
      const next = i < 0 ? withBeds.find((s) => s.beds === 1) || withBeds[0] : withBeds[Math.min(withBeds.length - 1, Math.max(0, i + Number(d)))];
      setDraft({ size: next.id });
    }
    repaint();
  });
  on(box, 'input[name=size]', (i) => { setDraft({ size: i.value }); repaint(); }, 'change');
}
const timingToggle = () => `
  <div class="timing" role="radiogroup" aria-label="When do you need us?">
    <button role="radio" data-timing="express" class="${express() ? 'on' : ''}" aria-checked="${express()}"><b>${icon('truck', 22)}Express now</b><small>Arrives in about ${site.fees.aboutMin} min</small><span class="pill amber">+ AED ${site.fees.expressNew}</span></button>
    <button role="radio" data-timing="scheduled" class="${express() ? '' : 'on'}" aria-checked="${!express()}"><b>${icon('calendar', 22)}Schedule visit</b><small>From ${esc(site.firstDay)}</small><span class="pill sm">No extra fee</span></button>
  </div>`;
const miniMap = (label) => `<div class="minimap"><svg viewBox="0 0 600 260" role="img" aria-label="${esc(label)}"><rect width="600" height="260" fill="#f4f8f0"/>
  ${[[0, 0, 105, 76], [122, 0, 186, 76], [324, 0, 156, 76], [496, 0, 104, 76], [0, 92, 105, 76], [122, 92, 186, 76], [324, 92, 156, 76], [496, 92, 104, 76], [0, 184, 105, 76], [122, 184, 186, 76], [324, 184, 156, 76], [496, 184, 104, 76]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e6efdf"/>`).join('')}
  <path d="M-10 250 610 20" stroke="#f3dca6" stroke-width="15"/><path d="M172 60 430 38 510 134 400 220 200 198 136 130z" fill="rgba(120,200,90,.42)" stroke="#3c7a22" stroke-width="3"/>
  ${[[264, 112], [400, 96], [216, 154], [342, 148], [296, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#e8872b"/>`).join('')}</svg><span>${esc(label)}</span></div>`;

/* ---------- screen 21: same pest as the neighbors? ---------- */
route('/book', async () => {
  if (needArea()) return null;
  if (S.draft.preset && pestOf(S.draft.preset)) { const p = S.draft.preset; setDraft({ preset: null }); go('/book/' + p, { replace: true }); return null; }
  const d = await api('/areas/' + S.area.slug);
  const top = d.topPest;
  return {
    title: 'What are you seeing?', head: 'area', bar: true, flow: true,
    html: `<div class="flow">${miniMap(`Recent treatments in ${S.area.short}`)}
      <div class="card on"><h3 style="font-size:18px">${d.stats.share} of 10 jobs here were ${esc(top.single)}</h3><p class="sub">Last 90 days, from Akkad job records</p></div>
      <h1 class="big">Is that what you're seeing?</h1>
      <a class="btn lg" href="/book/${top.id}">Yes, ${esc(top.single)}</a>
      <a class="btn ghost" href="/book/services">Something else</a>
      <p class="note center">Not sure? <a href="/photos?mode=identify">Scan a photo</a> and we'll tell you.</p></div>`,
  };
});

/* ---------- screen 25: every pest, with signs and a starting price ---------- */
route('/book/services', async () => {
  if (needArea()) return null;
  const list = site.pests.filter((p) => !p.commercial);
  let pick = null;
  return {
    title: 'Which pest are you seeing?', head: 'area', bar: true, flow: true,
    html: `<div class="flow"><h1>Which pest are you seeing?</h1><p class="muted">Tap a card. Prices include VAT.</p>
      <div class="pests">${list.map((p) => pestTile(p, true)).join('')}</div>
      <button class="btn" id="cont" disabled>Choose a pest to continue</button></div>`,
    mount(root) {
      const cont = $('#cont', root);
      on(root, '[data-p]', (b) => {
        pick = site.pests.find((p) => p.id === b.dataset.p);
        $$('[data-p]', root).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        cont.disabled = false; cont.textContent = pick.inspection ? `Request a free ${pick.short.toLowerCase()} survey` : `Continue with ${pick.single}`;
      });
      cont.addEventListener('click', () => go(pick.inspection ? '/inspection?job=termite' : '/book/' + pick.id));
    },
  };
});

/* ---------- screens 22-24, 26, 29-30: timing on top, then packages and home size ---------- */
route('/book/:pest', async ({ pest }) => {
  if (needArea()) return null;
  const p = pestOf(pest);
  if (!p) { go('/book/services', { replace: true }); return null; }
  if (S.draft.pest !== p.id) setDraft({ pest: p.id, pkg: null, size: null });
  const card = (pk) => {
    const from = pk.sized ? p.sizes[pk.sized][0].price : pk.price;
    return `<article class="card pkg"><div>${pk.badge ? `<span class="tag">${pk.badge}</span>` : ''}<h3>${esc(pk.title)}</h3>
      <div class="meta">${icon('shield', 20)}${cover(p)}</div><div class="meta">${icon('calendar', 20)}${esc(pk.duration)}</div>
      <div class="price">${pk.sized ? '<small>Starts at</small> ' : ''}${aed(from)}</div>
      <ul>${pk.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><button class="link b" data-details="${pk.id}">View details ›</button></div>
      <div class="side">${photo(pk.photo, imgFor(pk.photo) || imgFor(p.photo))}<button class="btn add" data-add="${pk.id}" aria-label="Add ${esc(pk.title)}">Add</button></div></article>`;
  };
  return {
    title: p.service, head: 'area', bar: true, flow: true,
    html: `<div class="flow wide"><a class="back" href="/book/services">${icon('left', 16)}All pests</a><h1>When do you need us?</h1>${timingToggle()}
      <p class="muted">${esc(p.intro)}</p><div class="pkgs">${p.packages.map(card).join('')}</div></div>`,
    mount(root) {
      on(root, '[data-timing]', (b) => { setDraft({ timing: b.dataset.timing }); $$('[data-timing]', root).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); });
      on(root, '[data-add]', (b) => sizeSheet(p, b.dataset.add));
      on(root, '[data-details]', (b) => {
        const pk = p.packages.find((x) => x.id === b.dataset.details);
        explain(p, { rows: [[`Treatment, materials, ${wty(p)}`, (pk.sized ? 'from ' : '') + (pk.sized ? p.sizes[pk.sized][0].price : pk.price)]], title: esc(pk.title), cta: 'Add this package', done: () => sizeSheet(p, pk.id) });
      });
    },
  };
});

function sizeSheet(p, pkgId) {
  setDraft({ pkg: pkgId });
  const paint = () => {
    const pk = p.packages.find((x) => x.id === S.draft.pkg);
    const type = pk.sized;
    if (type) ensureSize(p, pk);
    const c = chosen(p);
    const sizedPkgs = p.packages.filter((x) => x.sized);
    const fee = express() ? site.fees.expressNew : 0;
    openLayer('sheet', `
      <h2 class="plain">${esc(pk.title)}</h2>
      <p class="muted">${type ? 'Choose your home size. ' : ''}Price includes VAT${p.warrantyMonths ? ` and a ${wty(p)}` : ''}.</p>
      ${type && sizedPkgs.length > 1 ? `<div class="seg">${sizedPkgs.map((x) => `<button data-seg="${x.id}" class="${x.id === pk.id ? 'on' : ''}">${x.sized === 'villa' ? 'Villa' : 'Apartment'}</button>`).join('')}</div>` : ''}
      ${type ? sizeControls(p, pk) : ''}
      <div class="card">${lines([[esc(c.line), aed(c.price)], express() ? ['Schedule fast', aed(fee)] : ['Scheduled visit', 'No extra fee', 'green']], ['Total incl. VAT', aed(c.price + fee)])}</div>
      <button class="btn lg" data-next>${express() ? 'Continue to payment' : 'Choose a time'}</button>`, {
      mount(box) {
        on(box, '[data-seg]', (b) => { setDraft({ pkg: b.dataset.seg }); paint(); });
        wireSizeControls(box, p, paint);
        on(box, '[data-next]', () => go(`/book/${p.id}/${express() ? 'pay' : 'time'}`));
      },
    });
  };
  paint();
}

/* ---------- screen 31: pick a day and time ---------- */
route('/book/:pest/time', async ({ pest }) => {
  if (needArea()) return null;
  const p = pestOf(pest);
  if (!p || !chosen(p)) { go('/book/' + pest, { replace: true }); return null; }
  setDraft({ timing: 'scheduled' });
  const { days } = await api('/slots?days=3');
  return {
    title: 'Pick a day and time', head: 'area', flow: true,
    html: `<div class="flow"><span class="pill lg">${icon('calendar', 20)}Schedule for later · no extra fee</span><h1>Pick a day and time</h1>
      ${slotCards(days, S.draft.date, S.draft.slot)}
      <p class="note">Only real open slots from dispatch are shown.</p><p class="err"></p>
      <button class="btn" id="cont" ${S.draft.slot ? '' : 'disabled'}>Continue to payment</button></div>`,
    mount(root) {
      pickSlots(root, (date, slot, label) => { setDraft({ date, slot, dateLabel: label }); $('#cont', root).disabled = false; });
      $('#cont', root).addEventListener('click', () => go(`/book/${p.id}/pay`));
    },
  };
});
export const slotCards = (days, date, slot) => days.map((d) => `<div class="card daycard"><h3>${esc(d.label)}</h3>${d.slots.length
  ? `<div class="chips">${d.slots.map((s) => `<button class="chip ${d.iso === date && s === slot ? 'on' : ''}" data-date="${d.iso}" data-label="${esc(d.label)}" data-slot="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : '<p class="muted">Fully booked</p>'}</div>`).join('');
export function pickSlots(root, fn) {
  on(root, '[data-slot]', (b) => { $$('[data-slot]', root).forEach((x) => x.classList.toggle('on', x === b)); fn(b.dataset.date, b.dataset.slot, b.dataset.label); });
}

/* ---------- screens 27, 28, 32: review and pay ---------- */
const payMethods = (total) => `
  <button class="card pay on" data-pay="card" aria-pressed="true"><b>${icon('card')}Credit or debit card</b><small>Secure checkout by Network International</small>${payLogos(['visa', 'mastercard', 'apple-pay'], 'in-pay')}</button>
  <button class="card pay" data-pay="tabby" aria-pressed="false"><b>${icon('calendar')}Tabby</b><small>4 payments of ${aed(total / 4)}, if eligible</small>${payLogos(['tabby'], 'in-pay')}</button>`;
function wirePay(root) {
  on(root, '[data-pay]', (b) => $$('[data-pay]', root).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }));
  return () => $('[data-pay].on', root).dataset.pay;
}
const demoNote = () => (site.demo ? `<p class="demo-note"><b>Online payment is not connected yet.</b> Confirming books your visit now and nothing is charged; the amount is recorded as payment pending.</p>` : '');

// Screen 28: "Your service, explained".
function explain(p, { rows, total, title, cta = 'Got it, continue to pay', done }) {
  openLayer('popup', `<div class="explain"><h2 class="plain">${title || 'Your service, explained'}</h2>
    <h4>${total ? `Why you pay ${aed(total)}` : 'What it costs'}</h4>${lines(rows.map(([label, value, cls]) => [label, typeof value === 'number' ? aed(value) : /^from \d/.test(String(value)) ? 'from ' + aed(Number(String(value).slice(5))) : value, cls]))}
    <p class="note" style="margin-top:10px">VAT included. No extra charge without your approval.</p>
    <h4>What the technician will do</h4>${stepsHtml(p.steps, p.id, p.stepNotes, p)}
    <h4>How you pay</h4><p style="font-size:15.5px;color:var(--ink)">Card on Network's secure page, or Tabby in 4 payments. Receipt and service report sent on WhatsApp.</p>
    <button class="btn" style="margin-top:16px" data-ok>${cta}</button></div>`, { mount(box) { on(box, '[data-ok]', () => { closeLayer(); if (done) done(); }); } });
}

route('/book/:pest/pay', async ({ pest }) => {
  if (needArea()) return null;
  const p = pestOf(pest);
  const c = p && chosen(p);
  if (!c) { go('/book/' + pest, { replace: true }); return null; }
  if (!express() && !S.draft.slot) { go(`/book/${pest}/time`, { replace: true }); return null; }
  const fee = express() ? site.fees.expressNew : 0;
  const credit = Math.min(me.credit || 0, c.price + fee);
  const total = c.price + fee - credit;
  const rows = [[esc(c.label), aed(c.price)], express() ? ['Express fee', aed(fee)] : ['Scheduled visit', 'No extra fee', 'green']];
  if (credit) rows.push(['Akkad credit', '− ' + aed(credit), 'green']);
  const d = S.draft;
  return {
    title: 'Review and pay', head: 'area', flow: true,
    html: `<div class="flow"><h1>Review and pay</h1>
      <div class="card">${lines(rows, ['Total incl. VAT', aed(total)])}<button class="info-link" data-explain>${icon('info', 24)}What's included and how it works</button></div>
      <p class="muted">${esc(S.area.short)} · ${express() ? `Express today, about ${site.fees.aboutMin} min` : `${esc(d.dateLabel)}, ${esc(d.slot)}`}</p>
      <form class="card form-grid" novalidate><h3>Where should we come?</h3>
        <label class="field">${icon('check')}<span class="sr">Your name</span><input name="name" placeholder="Your name" autocomplete="name" value="${esc(d.name || '')}"></label>
        <label class="field">${icon('phone')}<span class="sr">Mobile number</span><input name="mobile" type="tel" inputmode="tel" placeholder="Mobile number (WhatsApp)" autocomplete="tel" value="${esc(d.mobile || '')}"></label>
        <div class="two"><label class="field">${icon('pin')}<span class="sr">Building or villa</span><input name="building" placeholder="Building or villa" autocomplete="address-line1" value="${esc(d.building || '')}"></label>
          <label class="field"><span class="sr">Apartment number</span><input name="apt" placeholder="Apt no." autocomplete="address-line2" value="${esc(d.apt || '')}"></label></div>
      </form>
      ${total ? payMethods(total) : '<div class="card on"><h3>Nothing to pay</h3><p class="sub">Your Akkad credit covers this booking.</p></div>'}
      ${demoNote()}<p class="err"></p><button class="btn" id="confirm">Confirm booking</button></div>`,
    mount(root) {
      const method = total ? wirePay(root) : () => 'card';
      on(root, '[data-explain]', () => explain(p, { rows: [[`Treatment, materials, ${wty(p)}`, c.price], ...(express() ? [[`Express fee, team within about ${site.fees.aboutMin} min`, fee]] : [['Scheduled visit', 'No extra fee', 'green']])], total: c.price + fee }));
      on(root, '#confirm', (btn) => busy(btn, async () => {
        const f = Object.fromEntries(new FormData($('form', root)));
        setDraft(f);
        try {
          const { booking } = await api('/bookings', { area: S.area.slug, pest: p.id, pkg: d.pkg, size: d.size, mattresses: c.mattresses || undefined, timing: express() ? 'express' : 'scheduled', date: d.date, slot: d.slot, payMethod: method(), ...f });
          remember(booking);
          setDraft({ pkg: null, size: null, mattresses: null, date: null, slot: null, dateLabel: null });
          await loadMe();
          go(`/booking/${booking.id}/${booking.tracking ? 'track' : 'confirmed'}`);
        } catch (e) { showErr(root, e); }
      }));
    },
  };
});

/* ---------- screens 37-40: a warranty customer skips the selling ---------- */
route('/warranty', async () => {
  const known = me.warranties[0];
  return {
    title: 'Warranty call-out', head: 'area', flow: true,
    html: `<div class="flow"><h1 class="ic-row" style="gap:10px">${icon('shield', 28)}Warranty call-out</h1>
      <p class="muted">Enter the booking number from your receipt or WhatsApp message.</p>
      <form class="stack" novalidate><label class="field"><span class="sr">Booking number</span><input name="no" placeholder="AK-10482" autocapitalize="characters" autocomplete="off" value="${esc(known ? known.id : '')}"></label>
      <p class="err"></p><button class="btn">Find my booking</button></form>
      <p class="center"><a class="link" href="/find">Booked by phone, or no booking number? Use my mobile number</a></p>
      ${helpBox("Can't find your booking number?", "Message us and we'll look it up for you.")}</div>`,
    mount(root) {
      $('form', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const no = $('[name=no]', root).value.trim();
        if (!no) return showErr(root, new Error('Please enter your booking number.'));
        busy($('form .btn', root), async () => {
          try { const w = await api('/warranty/lookup', { bookingNo: no }); go('/warranty/' + w.id); } catch (err) { showErr(root, err); }
        });
      });
    },
  };
});

route('/warranty/:id', async ({ id }) => {
  let w;
  try { w = await api('/warranty/lookup', { bookingNo: id }); } catch (e) {
    return { title: 'Warranty call-out', flow: true, html: `<div class="flow"><h1 class="ic-row" style="gap:10px">${icon('shield', 28)}Warranty call-out</h1><div class="card warn"><h3>${esc(e.message)}</h3>${e.data && e.data.ended ? '<p class="sub">A new treatment starts a fresh warranty.</p>' : ''}</div>
      ${e.data && e.data.ended ? `<a class="btn" href="${S.area ? '/book/' + e.data.pest : '/area'}">Book again</a>` : '<a class="btn" href="/warranty">Try another booking number</a>'}<a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></div>` };
  }
  const { days } = await api('/slots?days=3');
  const st = { timing: 'express', date: null, slot: null, addressOk: null };
  return {
    title: 'Warranty call-out', head: 'area', flow: true,
    html: `<div class="flow"><h1 class="ic-row" style="gap:10px">${icon('shield', 28)}Warranty call-out</h1>
      <div class="card"><p class="muted">Is this still the address?</p><h3 style="margin:8px 0 12px">${esc(w.address)}</h3>
        <div class="row" id="addr"><button class="btn" data-a="yes">Yes</button><button class="btn ghost" data-a="no">No, update</button></div>
        <div class="form-grid" id="newaddr" hidden style="margin-top:12px"><div class="two"><label class="field">${icon('pin')}<span class="sr">Building or villa</span><input name="building" placeholder="Building or villa"></label><label class="field"><span class="sr">Apartment number</span><input name="apt" placeholder="Apt no."></label></div></div></div>
      <span class="pill lg">Covered · AED 0 treatment</span>
      <button class="card on" data-w="express"><span class="lines"><span style="display:flex;justify-content:space-between"><h3>Express today</h3><span class="pill amber">+ AED ${site.fees.expressWarranty}</span></span></span><p class="sub">Nearby team, about ${site.fees.aboutMin} min</p></button>
      <button class="card" data-w="scheduled"><span style="display:flex;justify-content:space-between;align-items:baseline"><h3>Schedule a visit</h3><span class="muted">from ${esc(site.firstDay)}</span></span><p class="sub">No extra fee</p></button>
      <div id="slots" hidden class="stack">${slotCards(days)}</div>
      <p class="muted">The treatment is free under your warranty. Only the express call-out is charged.</p>
      <p class="err"></p><button class="btn" id="confirm">Confirm warranty visit</button></div>`,
    mount(root) {
      on(root, '[data-a]', (b) => {
        st.addressOk = b.dataset.a === 'yes';
        $$('[data-a]', root).forEach((x) => { x.className = 'btn' + (x === b ? '' : ' ghost'); });
        $('#newaddr', root).hidden = st.addressOk;
        if (!st.addressOk) $('[name=building]', root).focus();
      });
      on(root, '[data-w]', (b) => { st.timing = b.dataset.w; $$('[data-w]', root).forEach((x) => x.classList.toggle('on', x === b)); $('#slots', root).hidden = st.timing !== 'scheduled'; });
      pickSlots(root, (date, slot) => { st.date = date; st.slot = slot; });
      on(root, '#confirm', (btn) => busy(btn, async () => {
        const body = { bookingNo: w.id, timing: st.timing, date: st.date, slot: st.slot };
        if (st.addressOk === false) {
          body.building = $('[name=building]', root).value.trim(); body.apt = $('[name=apt]', root).value.trim();
          if (!body.building) return showErr(root, new Error('Please add your new building or villa.'));
        }
        if (st.timing === 'scheduled' && !st.slot) return showErr(root, new Error('Please pick a day and time for your visit.'));
        if (st.timing === 'express') { setDraft({ warranty: body }); return go(`/warranty/${w.id}/pay`); }
        try { const { booking } = await api('/warranty/bookings', body); remember(booking); await loadMe(); go(`/booking/${booking.id}/confirmed`); } catch (e) { showErr(root, e); }
      }));
    },
  };
});

route('/warranty/:id/pay', async ({ id }) => {
  const body = S.draft.warranty;
  if (!body || body.bookingNo !== id) { go('/warranty/' + id, { replace: true }); return null; }
  const w = await api('/warranty/lookup', { bookingNo: id });
  const p = site.pests.find((x) => x.id === w.pest);
  const fee = site.fees.expressWarranty;
  return {
    title: 'Review and pay', head: 'area', flow: true,
    html: `<div class="flow"><h1>Review and pay</h1>
      <div class="card">${lines([[`Warranty treatment · ${esc(w.id)}`, 'AED 0'], ['Express call-out', aed(fee)]], ['Total incl. VAT', aed(fee)])}<button class="info-link" data-explain>${icon('info', 24)}What's included and how it works</button></div>
      <p class="muted">${esc(w.areaShort)} · Express today, about ${site.fees.aboutMin} min · treatment free under warranty</p>
      ${payMethods(fee)}${demoNote()}<p class="err"></p><button class="btn" id="confirm">Confirm booking</button></div>`,
    mount(root) {
      const method = wirePay(root);
      on(root, '[data-explain]', () => explain(p, { rows: [['Warranty treatment and materials', 0], [`Express call-out, team within about ${site.fees.aboutMin} min`, fee]], total: fee }));
      on(root, '#confirm', (btn) => busy(btn, async () => {
        try { const { booking } = await api('/warranty/bookings', { ...body, payMethod: method() }); remember(booking); setDraft({ warranty: null }); await loadMe(); go(`/booking/${booking.id}/track`); } catch (e) { showErr(root, e); }
      }));
    },
  };
});
