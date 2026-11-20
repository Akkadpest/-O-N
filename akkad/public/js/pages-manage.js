// After the sale: confirmation, live tracking, reschedule, cancel, and finding a booking (screens 33-36, 41-56).
import { S, save, site, me, api, bookingApi, download, route, go, esc, icon, aed, lines, on, $, $$, busy, showErr, openLayer, closeLayer, remember, loadMe, onLeave, toast, shell, helpBox, stepsHtml } from './core.js';

const setDraft = (patch) => { S.draft = { ...S.draft, ...patch }; save(); };
const getBooking = async (id) => (await bookingApi(id)).booking;
const contactRow = (a = 'Call', b = 'WhatsApp') => `<div class="row"><a class="btn ghost" href="${site.company.phoneHref}">${a}</a><a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">${b}</a></div>`;
const pending = (b) => b.paymentStatus === 'pending';
const paidText = (b) => (b.kind === 'warranty' && !b.total ? '<span class="green">AED 0 · covered by warranty</span>'
  : pending(b) ? `${aed(b.total)} · payment pending` : `${aed(b.total)}${b.payMethod === 'tabby' ? ' with Tabby' : ' by card'}`);
const pendingNote = (b) => (pending(b) ? '<p class="demo-note">Online payment is not connected yet, so nothing has been charged. Your visit is booked and the amount is shown as pending.</p>' : '');
const warrantyNote = (b) => (b.kind === 'warranty' ? 'Same address. Treatment stays free under your warranty.' : `Same service, same address${b.warrantyMonths ? `, same ${b.warrantyMonths}-month warranty` : ''}.`);

/* ---------- screens 33 and 40: booking confirmed ---------- */
route('/booking/:id/confirmed', async ({ id }) => {
  const b = await getBooking(id);
  if (b.tracking) { go(`/booking/${id}/track`, { replace: true }); return null; }
  return {
    title: 'Booking confirmed', flow: true, banner: false,
    html: `<div class="flow"><span class="pill lg">${icon('check', 22)}Booking confirmed · ${esc(b.id)}</span>
      <h1>See you on ${esc(b.weekday)}</h1>
      <div class="card">${lines([['Date', `<b>${esc(b.dateLabel)}</b>`], ['Time slot', `<b>${esc(b.slot)}</b>`], ['Service', esc(b.kind === 'warranty' ? 'Warranty visit' : b.label)],
        ['Total', !b.total ? '<span class="green">AED 0 · nothing to pay</span>' : pending(b) ? `${aed(b.total)} · payment pending` : `${aed(b.total)} paid`]])}</div>${pendingNote(b)}
      <div class="card"><p class="muted">Before we arrive</p><p style="font-size:16px;color:var(--ink);margin-top:8px">${esc(b.prep)}</p></div>
      <p class="muted">A reminder is sent on WhatsApp the day before, and live tracking starts when the technician sets off.</p>
      <div class="row"><a class="btn ghost" href="/booking/${b.id}/reschedule">Reschedule</a><a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
      <p class="center"><a class="link" href="/booking/${b.id}">Manage this booking</a> · <a class="link" href="/reminder/${b.id}">See the WhatsApp reminder</a></p></div>`,
  };
});

/* ---------- screens 34-36 and 50: one straight line ---------- */
route('/booking/:id/track', async ({ id }) => {
  let b = await getBooking(id);
  const body = () => {
    const t = b.tracking;
    if (!t) {
      if (b.status === 'done') return `<span class="pill lg">${icon('check', 22)}Visit complete · ${esc(b.id)}</span><h1>Your treatment is done</h1>
        <div class="card on"><h3>${b.warrantyUntilLabel ? `Your warranty is active until ${esc(b.warrantyUntilLabel)}` : 'Covered by your warranty'}</h3><p class="sub">The service report and receipt are on WhatsApp. If pests return, we come back free.</p></div><a class="btn" href="/my-bookings">My bookings</a>`;
      if (b.status === 'cancelled') return `<h1>This booking was cancelled</h1><a class="btn" href="/my-bookings">My bookings</a>`;
      return `<span class="pill lg">${icon('check', 22)}Booking confirmed · ${esc(b.id)}</span><h1>Tracking opens on the day</h1>
        <div class="card">${lines([['Your visit', `<b>${esc(b.when)}</b>`], ['Service', esc(b.label)]])}</div>
        <p class="muted">Live tracking starts when the technician sets off. We will message you on WhatsApp the moment he does.</p>
        ${site.demo ? `<p class="demo-note">Demo mode: dispatch is simulated. Tap below to see what the customer sees on the day.</p><button class="btn ghost" data-setoff>Demo: technician sets off now</button>` : ''}
        <div class="row"><a class="btn ghost" href="/booking/${b.id}/reschedule">Reschedule</a><a class="btn ghost" href="/booking/${b.id}">Manage booking</a></div>`;
    }
    const arrived = t.phase === 'arrived', nearby = t.phase === 'nearby';
    const pct = Math.round(t.progress * 100);
    const ph = (label, done) => `<span class="${done ? 'on' : ''}">${icon(done ? 'check' : 'info', 22)}${label}</span>`;
    return `<span class="pill lg">${icon('check', 22)}Booking confirmed · ${esc(b.id)}</span>
      <h1>Your technician ${arrived ? 'has arrived' : nearby ? 'is nearby' : 'has set off'}</h1>
      <div class="card eta">${arrived ? `<div class="bigcheck" style="margin-top:0">${icon('tick', 40, 'stroke-width="3"')}</div><p>Arrived ${esc(t.arriveClock)}</p>`
        : `<div class="big" aria-live="polite">${t.remaining} <small>min</small></div><p>Arriving about ${esc(t.arriveClock)}</p>`}
        <div class="route ${arrived ? 'done' : ''}"><span class="rail"></span><span class="fill" style="width:${pct}%"></span><span class="mark"></span><span class="a"></span>
          ${arrived ? '' : `<span class="van" style="left:${pct}%">${icon('truck', 26)}</span>`}<span class="z">${icon(arrived ? 'check' : 'pin', 22)}</span></div>
        <div class="route-l"><span>Start</span><span>Nearby</span><span>Your home</span></div>
        ${arrived ? '' : '<div class="updating"><span class="spin"></span>Updating live location...</div>'}</div>
      <div class="phases">${ph('Set off', true)}${ph('Nearby', nearby || arrived)}${ph('Arrived', arrived)}</div>
      ${arrived ? `<div class="card on"><h3>Treatment in progress</h3><p class="sub">You will get the service report and payment receipt on WhatsApp when he finishes. ${b.kind === 'warranty' ? 'This visit is covered by your warranty.' : b.warrantyMonths ? 'Your warranty starts today.' : ''}</p></div>`
        : nearby ? `<div class="card" style="background:#fafbf8"><h3>Almost there</h3><p class="sub">Please be ready to let the technician in, or tell security he is coming.</p></div>`
        : `<div class="card" style="background:#fafbf8"><h3>Before he arrives</h3><p class="sub">${esc(b.prep)}</p></div>`}
      <div class="card ic-row"><span class="ic-circle">${icon('image', 24)}</span><div class="grow"><h3>Technician name</h3><p class="sub">Akkad van · plate shown here</p></div></div>
      ${contactRow()}${arrived ? '' : '<p class="center"><button class="link" data-change>Need to change the time?</button></p>'}`;
  };
  return {
    title: 'Track your technician', flow: true, banner: false,
    html: `<div class="flow" id="track">${body()}</div>`,
    mount(root) {
      const box = $('#track', root);
      let last = b.tracking ? b.tracking.phase + b.tracking.remaining : b.status;
      const timer = setInterval(async () => {
        if (document.hidden || $('#layer').classList.contains('open')) return;
        try { b = await getBooking(id); } catch { return; }
        const now = b.tracking ? b.tracking.phase + b.tracking.remaining : b.status;
        if (now === last) {
          if (b.tracking && b.tracking.phase !== 'arrived') { const pct = Math.round(b.tracking.progress * 100) + '%'; $('.fill', box).style.width = pct; $('.van', box).style.left = pct; }
          return;
        }
        const phaseChanged = !last.startsWith(b.tracking ? b.tracking.phase : b.status);
        last = now;
        if (phaseChanged) { box.innerHTML = body(); loadMe(); } else { $('.big', box).innerHTML = `${b.tracking.remaining} <small>min</small>`; }
      }, 2500);
      onLeave(() => clearInterval(timer));
      on(box, '[data-setoff]', (btn) => busy(btn, async () => { await api(`/ops/bookings/${id}/set-off`, {}, { key: S.keys[id] }); b = await getBooking(id); last = ''; box.innerHTML = body(); await loadMe(); }));
      on(box, '[data-change]', () => onTheWay(b));
    },
  };
});

// Screen 50: already on the way.
async function onTheWay(b) {
  const { slots } = await bookingApi(b.id, '/later-today');
  const t = b.tracking;
  openLayer('sheet', `<h2>Your technician is already on the way</h2>
    <p style="font-size:16px">He set off at ${esc(t.setOffClock)} and is about ${t.remaining} min away.</p>
    <div class="card on"><div class="ic-row">${icon('calendar', 34)}<div class="grow"><h3 style="font-size:18px">Come later today</h3><p class="sub">${slots.length ? 'Pick a time below. No extra fee.' : 'No later slots are left today.'}</p></div></div>
      ${slots.length ? `<div class="chips" style="margin-top:12px">${slots.map((s) => `<button class="chip" data-later="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}</div>
    <a class="card ic-row" href="/booking/${b.id}/reschedule" style="text-decoration:none">${icon('calendar', 28)}<span class="grow"><h3 style="font-size:18px">Move to another day</h3><p class="sub">${b.expressFee ? `The ${aed(b.expressFee)} express fee is not refunded once he has set off.` : 'Free. Pick any open day.'}</p></span></a>
    <p class="err"></p><a class="btn ghost" href="${site.company.phoneHref}">${icon('phone', 22)}Call the technician</a>`, {
    mount(box) {
      on(box, '[data-later]', (btn) => busy(btn, async () => {
        try { await bookingApi(b.id, '/reschedule', { laterToday: true, slot: btn.dataset.later }); await loadMe(); closeLayer(); go(`/booking/${b.id}/moved`); } catch (e) { showErr(box, e); }
      }));
    },
  });
}

/* ---------- screens 44 and 48: your booking ---------- */
route('/booking/:id', async ({ id }) => {
  const b = await getBooking(id);
  const live = b.status === 'on_the_way' || b.status === 'arrived';
  const pill = b.status === 'cancelled' ? `<span class="pill lg" style="background:var(--warn-bg);color:#5f3d00">${icon('info', 22)}Cancelled</span>`
    : b.status === 'done' ? `<span class="pill lg">${icon('check', 22)}Visit complete</span>`
    : live ? `<span class="pill lg">${icon('truck', 22)}Technician on the way</span>`
    : b.kind === 'warranty' ? `<span class="pill lg">${icon('shield', 22)}Warranty visit · ${b.total ? 'express' : 'free'}</span>` : `<span class="pill lg">${icon('check', 22)}Booked · technician assigned on the day</span>`;
  const editable = b.status === 'booked' || b.status === 'on_the_way';
  return {
    title: 'Your booking', head: 'area', flow: true, banner: false,
    html: `<div class="flow">${pill}<h1>Your booking</h1>
      <div class="card">${lines([['<span class="k">Booking</span>', `<b>${esc(b.id)}</b>`], ['<span class="k">Service</span>', esc(b.label)], ['<span class="k">Date and time</span>', `<b>${esc(b.when)}</b>`], [`<span class="k">${pending(b) ? 'Payment' : 'Paid'}</span>`, paidText(b)]])}</div>
      ${b.status === 'booked' ? `<a class="btn" href="/booking/${b.id}/reschedule">${icon('calendar', 22)}Reschedule</a>` : ''}
      ${live ? `<a class="btn" href="/booking/${b.id}/track">${icon('truck', 22)}Track my technician</a>` : ''}
      ${b.status === 'done' && b.kind === 'new' ? (b.warrantyActive ? `<div class="card on"><h3 class="ic-row" style="gap:8px">${icon('shield')}Warranty active until ${esc(b.warrantyUntilLabel)}</h3><p class="sub">If the same pest returns before then, we come back free.</p><a class="btn ghost" style="margin-top:12px" href="/warranty/${b.id}">Pests back? Book a free visit</a></div>`
        : `<div class="card"><h3>Warranty ended ${esc(b.warrantyUntilLabel || '')}</h3><a class="btn ghost" style="margin-top:12px" href="${S.area ? '/book/' + b.pest : '/area'}">Book again</a></div>`) : ''}
      ${b.status === 'cancelled' && b.credit ? `<div class="card warn"><h3>${aed(b.credit.amount)} Akkad credit</h3><p class="sub">Use it on any service until ${esc(b.credit.untilLabel)}. It is taken off your next booking once you confirm your mobile number.</p></div><button class="btn" data-book>Book a new service</button>` : ''}
      <div class="card ic-row">${icon('pin', 28)}<div class="grow"><h3>Address</h3><p class="sub">${esc(b.address)}</p></div>${editable ? '<button class="btn ghost sm" data-edit="address">Change</button>' : ''}</div>
      ${editable ? `<div class="card ic-row">${icon('info', 28)}<div class="grow"><h3>Note for the technician</h3><p class="sub">${esc(b.note || 'Building access, pets, parking')}</p></div><button class="btn ghost sm" data-edit="note">${b.note ? 'Edit' : 'Add'}</button></div>` : ''}
      ${b.status === 'booked' ? `<p class="center green">Reschedule free, any time before the technician sets off</p><p class="center"><button class="link" data-cancel>Cancel booking</button></p>` : ''}
      ${b.status === 'done' ? `<a class="btn ghost" href="/booking/${b.id}/report">${icon('doc', 22)}Service report</a>` : ''}
      ${b.status === 'booked' && b.slot ? `<p class="center"><a class="link" href="/reminder/${b.id}">See the WhatsApp reminder</a></p>` : ''}
      ${contactRow('Call us')}</div>`,
    mount(root) {
      on(root, '[data-cancel]', () => cancelSheet(b));
      on(root, '[data-edit]', (btn) => {
        const isNote = btn.dataset.edit === 'note';
        openLayer('sheet', `<h2 class="plain">${isNote ? 'Note for the technician' : 'Change the address'}</h2>
          ${isNote ? `<label class="field" style="align-items:flex-start"><span class="sr">Note</span><textarea name="note" maxlength="300" placeholder="Building access, pets, parking">${esc(b.note)}</textarea></label>`
            : `<p class="muted">Same area, new building? Tell us where to come.</p><div class="form-grid"><div class="two"><label class="field">${icon('pin')}<span class="sr">Building or villa</span><input name="building" placeholder="Building or villa"></label><label class="field"><span class="sr">Apartment number</span><input name="apt" placeholder="Apt no."></label></div></div>`}
          <p class="err"></p><button class="btn" data-save>Save</button>`, {
          mount(box) {
            on(box, '[data-save]', (s) => busy(s, async () => {
              try {
                await bookingApi(b.id, '/details', isNote ? { note: $('[name=note]', box).value } : { building: $('[name=building]', box).value, apt: $('[name=apt]', box).value });
                closeLayer(); toast('Saved'); go(location.pathname, { replace: true });
              } catch (e) { showErr(box, e); }
            }));
          },
        });
      });
    },
  };
});

// Screen 51: we offer to move it first.
function cancelSheet(b) {
  const amount = b.paid + b.creditUsed;
  openLayer('sheet', `<h2>Cancel your booking?</h2>
    <div class="card on"><h3 class="ic-row" style="gap:8px">${icon('calendar', 24)}Move it instead, free</h3><p class="sub" style="margin:8px 0 12px">Keep your price and warranty. Pick any open day in the next 30 days.</p><a class="btn" href="/booking/${b.id}/reschedule">Pick a new time</a></div>
    <p class="muted">Tell us why you're cancelling</p>
    <div class="chips">${['Not at home', 'Pests gone', 'Found cheaper', 'Other'].map((r) => `<button class="chip" data-r="${r}">${r}</button>`).join('')}</div>
    ${pending(b) ? `<div class="card warn"><p><b>Nothing has been charged.</b> Payment for this booking is still pending, so there is nothing to refund.</p></div>`
      : amount ? `<div class="card warn"><p><b style="font-size:17px">No cash refund.</b> If you cancel, your ${aed(amount)} stays as Akkad credit for 90 days, to use on any service.</p></div>`
      : `<div class="card warn"><p><b>Nothing was charged.</b> Your warranty stays active, so you can book this free visit again.</p></div>`}
    <p class="err"></p><button class="btn danger" data-go>Cancel anyway</button>`, {
    mount(box) {
      let reason = '';
      on(box, '[data-r]', (c) => { reason = c.dataset.r; $$('[data-r]', box).forEach((x) => x.classList.toggle('on', x === c)); });
      on(box, '[data-go]', (btn) => busy(btn, async () => {
        try { await bookingApi(b.id, '/cancel', { reason }); await loadMe(); closeLayer(); toast('Your booking is cancelled'); go('/booking/' + b.id, { replace: true }); } catch (e) { showErr(box, e); }
      }));
    },
  });
}

/* ---------- service report for a finished visit (the "Report" links) ---------- */
route('/booking/:id/report', async ({ id }) => {
  const b = await getBooking(id);
  if (b.status !== 'done') { go('/booking/' + id, { replace: true }); return null; }
  const p = site.pests.find((x) => x.id === b.pest) || { steps: [] };
  return {
    title: 'Service report', flow: true, banner: false,
    html: `<div class="flow report"><span class="pill lg">${icon('check', 22)}Visit complete · ${esc(b.id)}</span><h1>Service report</h1>
      <div class="card">${lines([['<span class="k">Booking</span>', `<b>${esc(b.id)}</b>`], ['<span class="k">Service</span>', esc(b.label)], ['<span class="k">Visit date</span>', `<b>${esc(b.dateLong)}</b>`],
        ['<span class="k">Address</span>', esc(b.address)], [`<span class="k">${pending(b) ? 'Payment' : 'Paid'}</span>`, paidText(b)]])}</div>
      <div class="card"><h3>What the technician did</h3>${stepsHtml(p.steps)}</div>
      ${b.kind === 'new' && b.warrantyUntilLabel ? `<div class="card ${b.warrantyActive ? 'on' : ''}"><h3 class="ic-row" style="gap:8px">${icon('shield')}${b.warrantyMonths}-month warranty</h3><p class="sub">${b.warrantyActive ? 'Active until' : 'Ended on'} ${esc(b.warrantyUntilLabel)}. ${b.warrantyActive ? 'If the same pest returns, we come back free.' : ''}</p></div>` : ''}
      <p class="note">Products used are Dubai Municipality approved. The technician's own notes and product list are added to this report by dispatch.</p>
      <div class="row noprint"><button class="btn ghost" data-print>Save as PDF</button><a class="btn ghost" href="/my-bookings">My bookings</a></div></div>`,
    mount(root) { on(root, '[data-print]', () => window.print()); },
  };
});

/* ---------- screens 45-49: moving a visit takes three taps ---------- */
route('/booking/:id/reschedule', async ({ id }) => {
  const b = await getBooking(id);
  if (!b.canReschedule && b.status !== 'on_the_way') { go('/booking/' + id, { replace: true }); return null; }
  const { days } = await api(`/slots?days=5&except=${id}`);
  const enRoute = b.status === 'on_the_way';
  let day = days.find((d) => d.iso !== b.date && d.slots.length) || days[0];
  let slot = null;
  const fee = b.kind === 'warranty' ? site.fees.expressWarranty : site.fees.expressNew;
  const dayCard = () => `<h3>${esc(day.label)}</h3>${day.slots.length ? `<div class="chips">${day.slots.map((s) => `<button class="chip ${s === slot ? 'on' : ''}" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : '<p class="muted">Fully booked. Please try another day.</p>'}`;
  return {
    title: 'Pick a new time', head: 'area', flow: true, banner: false,
    html: `<div class="flow"><h1>Pick a new time</h1><p class="muted">Current: ${esc(b.when)}</p>
      <div class="daystrip">${days.map((d) => `<button data-d="${d.iso}" class="${d.iso === b.date ? 'cur' : d.iso === day.iso ? 'on' : ''}" ${d.iso === b.date ? 'disabled aria-label="Current day"' : ''}>${d.dow}<b>${d.day}</b></button>`).join('')}</div>
      <div class="card daycard" id="day">${dayCard()}</div>
      <div class="card on ic-row" style="gap:8px;color:var(--ink-green);font-weight:600">${icon('check', 24)}${enRoute && b.expressFee ? `Free change. The ${aed(b.expressFee)} express fee stays paid.` : 'Free change. Your payment carries over.'}</div>
      ${enRoute ? '' : `<div class="card ic-row">${icon('truck', 28)}<div class="grow"><h3>Need it sooner?</h3><p class="sub">Express today, about ${site.fees.aboutMin} min · + ${aed(fee)}</p></div><button class="btn ghost sm" data-express>Switch</button></div>`}
      <p class="err"></p><button class="btn" id="review" disabled>Review the change</button></div>`,
    mount(root) {
      on(root, '[data-d]', (btn) => { day = days.find((d) => d.iso === btn.dataset.d); slot = null; $$('[data-d]:not(.cur)', root).forEach((x) => x.classList.toggle('on', x === btn)); $('#day', root).innerHTML = dayCard(); $('#review', root).disabled = true; });
      on(root, '[data-s]', (btn) => { slot = btn.dataset.s; $('#day', root).innerHTML = dayCard(); $('#review', root).disabled = false; });
      on(root, '#review', () => { setDraft({ move: { id, date: day.iso, slot, label: day.label } }); go(`/booking/${id}/reschedule/confirm`); });
      on(root, '[data-express]', () => { setDraft({ move: { id, express: true } }); go(`/booking/${id}/reschedule/confirm`); });
    },
  };
});

route('/booking/:id/reschedule/confirm', async ({ id }) => {
  const m = S.draft.move;
  if (!m || m.id !== id) { go(`/booking/${id}/reschedule`, { replace: true }); return null; }
  const b = await getBooking(id);
  const fee = b.kind === 'warranty' ? site.fees.expressWarranty : site.fees.expressNew;
  const [d1, d2] = b.slot ? [b.dateLabel, b.slot] : ['Today', 'Express'];
  return {
    title: 'Confirm the new time', head: 'area', flow: true, banner: false,
    html: `<div class="flow"><h1>Confirm the new time</h1>
      <div class="card fromto"><div class="old"><small>From</small><b>${esc(d1)}</b><b>${esc(d2)}</b></div>${icon('arrow', 34)}<div><small>To</small>${m.express ? `<b>Today</b><b>about ${site.fees.aboutMin} min</b>` : `<b>${esc(m.label)}</b><b>${esc(m.slot)}</b>`}</div></div>
      <div class="card">${lines([[pending(b) ? 'Booking total (payment pending)' : 'Already paid', b.kind === 'warranty' && !b.total ? 'AED 0 (warranty)' : aed(b.total)], m.express ? ['Express fee', aed(fee)] : ['Reschedule fee', 'Free', 'green']], ['To pay now', aed(m.express ? fee : 0)])}</div>
      <p class="muted">${warrantyNote(b)}</p>${m.express && site.demo ? '<p class="demo-note">Demo mode: the express fee is not charged to a card.</p>' : ''}
      <p class="err"></p><button class="btn lg" id="ok">${m.express ? 'Confirm express visit' : 'Confirm new time'}</button>
      <a class="btn ghost" href="/booking/${id}">Keep ${esc(b.slot ? b.dateLabel : 'my express visit')}</a></div>`,
    mount(root) {
      on(root, '#ok', (btn) => busy(btn, async () => {
        try {
          await bookingApi(id, '/reschedule', m.express ? { timing: 'express' } : { date: m.date, slot: m.slot });
          setDraft({ move: null }); await loadMe();
          go(m.express ? `/booking/${id}/track` : `/booking/${id}/moved`);
        } catch (e) { showErr(root, e); }
      }));
    },
  };
});

route('/booking/:id/moved', async ({ id }) => {
  const b = await getBooking(id);
  const key = S.keys[id];
  return {
    title: 'Your visit is moved', head: 'area', flow: true, banner: false,
    html: `<div class="flow center"><div class="bigcheck">${icon('tick', 40, 'stroke-width="3"')}</div>
      <h1 class="big">Your visit is moved</h1><p style="font-size:16px" class="muted">${esc(b.when)} · Booking ${esc(b.id)}</p>
      <div class="card" style="text-align:left">${lines([[`<span class="ic-row" style="gap:8px">${icon('chat', 22)}WhatsApp confirmation</span>`, '<span class="green">Sent</span>'],
        [`<span class="ic-row" style="gap:8px">${icon('calendar', 22)}Reminder</span>`, esc(b.reminderLabel)], [`<span class="ic-row" style="gap:8px">${icon('truck', 22)}Live tracking</span>`, 'On the day']])}</div>
      ${b.slot ? `<button class="btn ghost" data-cal>${icon('calendar', 22)}Add to my calendar</button>` : ''}
      <div class="row"><a class="btn ghost" href="/booking/${b.id}">Manage booking</a><a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div></div>`,
    mount(root) { on(root, '[data-cal]', (btn) => busy(btn, () => download(`/bookings/${b.id}/calendar.ics`, `akkad-${b.id}.ics`, key).catch((e) => toast(e.message)))); },
  };
});

/* ---------- screens 42, 43, 56: finding the booking safely ---------- */
async function sendCode(root, body) {
  try {
    const r = await api('/auth/send-code', body);
    setDraft({ auth: { ...body, sentTo: r.sentTo, demoCode: r.demoCode || null, until: Date.now() + r.resendIn * 1000 } });
    go('/manage/code');
  } catch (e) { showErr(root, e); }
}
route('/manage', async () => ({
  title: 'Manage my booking', flow: true, bar: true,
  html: `<div class="flow"><h1>Manage my booking</h1><p class="muted">Reschedule, change the address or cancel.</p>
    <form class="stack" novalidate>
      <label class="field">${icon('info')}<span class="sr">Booking number</span><input name="no" placeholder="Booking number: AK-10483" autocapitalize="characters" autocomplete="off"></label>
      <label class="field">${icon('phone')}<span class="sr">Mobile number used to book</span><input name="mobile" type="tel" inputmode="tel" placeholder="Mobile number used to book" autocomplete="tel"></label>
      <p class="err"></p><button class="btn">Send me a code</button></form>
    <p class="note center">We send a 4-digit code on WhatsApp to keep your booking safe.</p>
    <p class="center"><a class="link" href="/find">No booking number? Use my mobile number only</a></p>
    ${helpBox("Can't find your booking number?", "It's in your WhatsApp confirmation and receipt. Or ask us.")}</div>`,
  mount(root) {
    $('form', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const no = $('[name=no]', root).value.trim(), mobile = $('[name=mobile]', root).value.trim();
      if (!no) return showErr(root, new Error('Please enter your booking number, or use your mobile number only.'));
      busy($('form .btn', root), () => sendCode(root, { mobile, bookingNo: no }));
    });
  },
}));
route('/find', async () => ({
  title: 'Find my bookings', flow: true, bar: true,
  html: `<div class="flow"><h1>Find my bookings</h1><p class="muted">On a new phone? Just your mobile number. No booking number needed.</p>
    <form class="stack" novalidate><label class="field">${icon('phone')}<span class="sr">Mobile number</span><input name="mobile" type="tel" inputmode="tel" placeholder="+971 50 123 4567" autocomplete="tel"></label>
    <p class="err"></p><button class="btn">Send me a code on WhatsApp</button></form>
    <p class="note center">We'll show every booking and warranty on this number.</p>
    <div class="card"><p class="muted">Have your booking number?</p><p style="margin-top:8px"><a class="link" href="/manage">Use booking number instead</a></p></div>
    <div class="card ic-row">${icon('chat', 22)}<div class="grow"><h3>Fastest way</h3><p class="sub">Open the link in your Akkad WhatsApp message. It opens your booking directly.</p></div></div>
    ${helpBox()}
    ${site.demo ? '<p class="demo-note">Demo mode: try the sample customer <b>+971 50 123 4567</b> (booking AK-10482, warranty active).</p>' : ''}</div>`,
  mount(root) {
    $('form', root).addEventListener('submit', (e) => { e.preventDefault(); busy($('form .btn', root), () => sendCode(root, { mobile: $('[name=mobile]', root).value.trim() })); });
  },
}));
route('/manage/code', async () => {
  const a = S.draft.auth;
  if (!a) { go('/find', { replace: true }); return null; }
  return {
    title: 'Enter your code', flow: true, bar: true,
    html: `<div class="flow"><h1>Enter your code</h1><p class="muted">Sent on WhatsApp to ${esc(a.sentTo)}</p>
      <div class="codebox">${[0, 1, 2, 3].map((i) => `<input inputmode="numeric" maxlength="1" pattern="[0-9]" aria-label="Digit ${i + 1}" ${i ? '' : 'autocomplete="one-time-code" autofocus'}>`).join('')}</div>
      ${a.demoCode ? `<p class="demo-note center">Demo mode: WhatsApp is not connected yet. Your code is <b>${esc(a.demoCode)}</b>.</p>` : site.demo ? '<p class="demo-note center">Demo mode: no booking was found on that number, so no code was issued.</p>' : ''}
      <p class="err center"></p><button class="btn" id="open">Open my booking</button>
      <p class="center muted">Didn't get it? <button class="link" id="again" disabled>Send again</button> <span id="count"></span></p></div>`,
    mount(root) {
      const boxes = $$('.codebox input', root);
      const code = () => boxes.map((b) => b.value).join('');
      const submit = () => busy($('#open', root), async () => {
        if (code().length < 4) return showErr(root, new Error('Please enter the 4-digit code.'));
        try {
          const r = await api('/auth/verify', { mobile: a.mobile, code: code(), bookingNo: a.bookingNo });
          setDraft({ auth: null }); await loadMe();
          go(r.bookingId ? '/booking/' + r.bookingId : '/my-bookings', { replace: true });
        } catch (e) { showErr(root, e); boxes.forEach((b) => { b.value = ''; }); boxes[0].focus(); }
      });
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); if (code().length === 4) submit(); });
        b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
        b.addEventListener('paste', (e) => { const d = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, 4); if (d.length) { e.preventDefault(); d.forEach((v, k) => { if (boxes[k]) boxes[k].value = v; }); if (d.length === 4) submit(); } });
      });
      on(root, '#open', submit);
      const tick = () => { const s = Math.max(0, Math.ceil((a.until - Date.now()) / 1000)); $('#count', root).textContent = s ? `in 0:${String(s).padStart(2, '0')}` : ''; $('#again', root).disabled = s > 0; };
      const timer = setInterval(tick, 500); tick(); onLeave(() => clearInterval(timer));
      on(root, '#again', (btn) => busy(btn, () => sendCode(root, { mobile: a.mobile, bookingNo: a.bookingNo })));
    },
  };
});

/* ---------- screen 54: one place for everything after the sale ---------- */
route('/my-bookings', async () => {
  await loadMe();
  if (me.state === 'none' && !me.verified && !me.cancelled.length) { go('/find', { replace: true }); return null; }
  const upcoming = me.upcoming.map((b) => `<div class="card on"><div style="display:flex;justify-content:space-between;align-items:center"><h3>Upcoming visit</h3><span class="pill sm">${b.tracking ? 'On the way' : 'Booked'}</span></div>
    <h3 style="margin-top:10px">${esc(b.when)}</h3><p class="sub">${esc(b.label)} · ${esc(b.id)}</p>
    <div class="row" style="margin-top:12px">${b.tracking ? `<a class="btn" href="/booking/${b.id}/track" style="flex:2">Track</a><a class="btn ghost" href="/booking/${b.id}">Manage</a>`
      : `<a class="btn" href="/booking/${b.id}/reschedule" style="flex:2">Reschedule</a><a class="btn ghost" href="/booking/${b.id}/track" style="color:var(--muted)">Track</a>`}</div>
    ${b.tracking ? '' : `<p class="sub" style="margin-top:10px">Tracking opens when the technician sets off. <a class="link" href="/booking/${b.id}">Manage or cancel</a></p>`}</div>`).join('');
  const warranties = me.warranties.map((b) => `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3 class="ic-row" style="gap:8px">${icon('shield')}Your warranty</h3><span class="green">Active</span></div>
    <p class="sub">${esc(b.service)} · until ${esc(b.warrantyUntilLabel)}</p><a class="btn ghost" style="margin-top:12px" href="/warranty/${b.id}">Pests back? Book a free visit</a></div>`).join('');
  const past = me.past.length ? `<div class="card"><h3 style="margin-bottom:10px">Past visits</h3><div class="lines">${me.past.map((b) => `<div><span class="muted">${esc(b.dateLong)} · ${esc(b.kind === 'warranty' ? 'Warranty visit' : b.service)}</span>
    ${b.kind === 'new' && !b.warrantyActive ? `<a class="link" href="${S.area ? '/book/' + b.pest : '/area'}" data-again="${b.pest}">Book again</a>` : `<a class="link" href="/booking/${b.id}/report">Report</a>`}</div>`).join('')}</div></div>` : '';
  const credit = me.cancelled.map((b) => `<div class="card warn"><h3>${aed(b.credit.amount)} Akkad credit</h3><p class="sub">From cancelled booking ${esc(b.id)}. Use it on any service until ${esc(b.credit.untilLabel)}.</p></div>`).join('');
  return {
    title: 'My bookings', flow: true, banner: false,
    html: `<div class="flow"><h1>My bookings</h1>${me.mobile ? `<p class="muted">Every booking on ${esc(me.mobile)}</p>` : ''}
      ${upcoming}${warranties}${credit}${past}
      ${upcoming || warranties || past || credit ? '' : '<div class="card"><h3>No bookings yet</h3><p class="sub">When you book, your visit, warranty and reports appear here.</p></div>'}
      <button class="btn ${upcoming ? 'ghost' : ''}" data-book>Book a new service</button>
      ${me.verified ? '<p class="center"><button class="link" data-out>Not you? Sign out on this device</button></p>' : '<p class="center"><a class="link" href="/find">Booked on another phone? Find my bookings</a></p>'}</div>`,
    mount(root) {
      on(root, '[data-again]', (a) => setDraft({ timing: 'scheduled', preset: a.dataset.again }));
      on(root, '[data-out]', async () => { await api('/logout', {}); S.keys = {}; S.draft = {}; save(); await loadMe(); go('/'); });
    },
  };
});

/* ---------- personal link in a WhatsApp message: no code needed ---------- */
route('/b/:key', async ({ key }, q) => {
  try {
    const r = await api('/link/' + encodeURIComponent(key));
    remember(r); await loadMe();
    go(`/booking/${r.id}${q.get('to') === 'reschedule' ? '/reschedule' : ''}`, { replace: true });
    return null;
  } catch (e) {
    return { title: 'Link expired', flow: true, html: `<div class="flow"><span class="ic-circle big">${icon('info', 28)}</span><h1>This link no longer works</h1><p class="muted">${esc(e.message)}</p><a class="btn" href="/find">Find my bookings${icon('arrow', 18)}</a>${helpBox()}</div>` };
  }
});

/* ---------- screen 41: the WhatsApp reminder, as the customer receives it ---------- */
route('/reminder/:id', async ({ id }) => {
  const b = await getBooking(id);
  return {
    title: 'WhatsApp reminder', flow: true, banner: false,
    html: `<div class="flow"><h1>The WhatsApp reminder</h1><p class="muted">Sent the day before the visit. Each button opens this website with the customer's personal link, so no code is needed.</p>
      <div class="wa"><header><i>A</i><div><b>Akkad Pest Control</b><small>Business account</small></div></header><div class="chat"><span class="day">Today</span>
        <div class="msg"><p>Hi, your Akkad visit is <b>${b.slot ? `tomorrow, ${esc(b.dateLabel)}, ${esc(b.slot)}` : 'today'}</b> at ${esc(b.building)}.</p><p>${esc(b.prep)}</p><p>Need another time? Move it free, any time before the technician sets off.</p><time>2:03 PM</time></div>
        <a href="/b/${encodeURIComponent(b.key)}">${icon('check', 22)}Confirm visit</a><a href="/b/${encodeURIComponent(b.key)}?to=reschedule">${icon('calendar', 22)}Reschedule</a><a href="${site.company.phoneHref}">${icon('phone', 22)}Call Akkad</a></div></div>
      <a class="btn ghost" href="/booking/${b.id}">Back to my booking</a></div>`,
  };
});
