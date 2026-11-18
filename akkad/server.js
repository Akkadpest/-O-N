// Akkad Pest Control website: Node.js (Express) server.
// Serves the site and the JSON API behind every screen of the flow.
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const C = require('./data/catalog');
const store = require('./lib/store');

const PORT = process.env.PORT || 3000;
// Payments, WhatsApp codes and dispatch are simulated until the real services
// are connected (Network International, Tabby, WhatsApp Business, dispatch).
const DEMO = process.env.AKKAD_LIVE !== '1';
// In demo mode the van covers the 28 minutes faster so tracking can be watched.
const TRACK_SPEED = Number(process.env.TRACK_SPEED || (DEMO ? 14 : 1));
const TZ = 'Asia/Dubai';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

/* ---------- helpers ---------- */
const db = () => store.load();
const pest = (id) => C.PESTS.find((p) => p.id === id);
const area = (slug) => C.AREAS.find((a) => a.slug === slug);
const fail = (res, code, message) => res.status(code).json({ error: message });
const clean = (s, n = 120) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);

function dubaiNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, minute: Number(p.minute) };
}
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const addMonths = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
const fmtDate = (iso, withYear) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: withYear ? undefined : 'short', day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined })
  .format(new Date(iso + 'T12:00:00Z')).replace(',', '');
const fmtClock = (date) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(date);
const weekday = (iso) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' }).format(new Date(iso + 'T12:00:00Z'));

function normMobile(input) {
  let d = String(input || '').replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (d.startsWith('05') && d.length === 10) d = '+971' + d.slice(1);
  if (/^5\d{8}$/.test(d)) d = '+971' + d;
  if (/^971\d{9}$/.test(d)) d = '+' + d;
  return /^\+\d{9,14}$/.test(d) ? d : null;
}
const maskMobile = (m) => m.replace(/^(\+971)(\d{2})\d{5}(\d{2})$/, '$1 $2 *** **$3').replace(/^(\+\d{3})\d+(\d{2})$/, '$1 *** **$2');
function maskAddress(a) {
  if (!a) return '';
  const keep = /^(tower|towers|building|residence|residences|villa|villas|street|st|block|cluster|bldg)$/i;
  const words = a.building.split(/\s+/).filter(Boolean);
  const b = words.map((w, i) => (i === 0 || keep.test(w) ? w : w[0] + '***')).join(' ');
  return b + (a.apt ? ', apt ' + String(a.apt)[0] + '**' : '');
}

/* ---------- slots ---------- */
const SLOT_PLAN = {
  Friday: ['9–11 AM', '2–4 PM', '6–8 PM'], Saturday: ['10 AM–12 PM', '4–6 PM'], Sunday: ['9–11 AM', '11 AM–1 PM', '4–6 PM'],
  Monday: ['9–11 AM', '1–3 PM', '5–7 PM'], Tuesday: ['10 AM–12 PM', '2–4 PM', '6–8 PM'], Wednesday: ['9–11 AM', '1–3 PM', '4–6 PM'], Thursday: ['9–11 AM', '2–4 PM', '5–7 PM'],
};
const SLOT_CAPACITY = 3;
const slotStartHour = (slot) => { const m = /^(\d+)(?:\s?(AM|PM))?–\d+\s?(AM|PM)$/.exec(slot); let h = Number(m[1]) % 12; if ((m[2] || m[3]) === 'PM') h += 12; return h; };
function openSlots(iso, exceptId) {
  const taken = {};
  for (const b of db().bookings) if (b.date === iso && b.slot && b.status === 'booked' && b.id !== exceptId) taken[b.slot] = (taken[b.slot] || 0) + 1;
  return (SLOT_PLAN[weekday(iso)] || []).filter((s) => (taken[s] || 0) < SLOT_CAPACITY);
}
function days(count, exceptId) {
  const first = addDays(dubaiNow().iso, 2); // scheduled visits open two days out
  return Array.from({ length: count }, (_, i) => addDays(first, i)).map((iso) => ({ iso, label: fmtDate(iso), dow: fmtDate(iso).split(' ')[0], day: Number(iso.slice(8)), slots: openSlots(iso, exceptId) }));
}
const slotOpen = (iso, slot, exceptId) => days(14, exceptId).some((d) => d.iso === iso && d.slots.includes(slot));

/* ---------- bookings ---------- */
function track(b) {
  if (!b.setOffAt) return null;
  const elapsedMin = ((Date.now() - b.setOffAt) / 60000) * TRACK_SPEED;
  const eta = b.etaMin || C.FEES.etaMin;
  const progress = Math.max(0.04, Math.min(1, elapsedMin / eta));
  const remaining = Math.max(0, Math.ceil(eta - elapsedMin));
  const arriveAt = new Date(b.setOffAt + (eta * 60000) / TRACK_SPEED);
  const phase = progress >= 1 ? 'arrived' : progress >= 0.75 ? 'nearby' : 'set_off';
  return { phase, progress, remaining, setOffClock: fmtClock(new Date(b.setOffAt)), arriveClock: fmtClock(arriveAt), done: elapsedMin > eta + 45 };
}
function refresh(b) {
  if (b.status === 'on_the_way' || b.status === 'arrived') {
    const t = track(b);
    if (t && t.phase === 'arrived' && b.status === 'on_the_way') b.status = 'arrived';
    if (t && t.done) {
      b.status = 'done';
      if (b.kind === 'new') b.warrantyUntil = addMonths(b.date, b.warrantyMonths || 3);
      store.save();
    }
  }
  return b;
}
function view(b) {
  refresh(b);
  const today = dubaiNow().iso;
  return {
    id: b.id, key: b.key, kind: b.kind, status: b.status, pest: b.pest, service: b.service, label: b.label,
    areaSlug: b.areaSlug, areaName: b.areaName, areaShort: b.areaShort, address: maskAddress(b.address), building: maskAddress({ building: b.address.building }),
    mobile: maskMobile(b.mobile), note: b.note || '', timing: b.timing, date: b.date, dateLabel: fmtDate(b.date), dateLong: fmtDate(b.date, true),
    weekday: weekday(b.date), slot: b.slot, when: b.timing === 'express' && !b.slot ? 'Express today' : `${fmtDate(b.date)}, ${b.slot}`,
    price: b.price, expressFee: b.expressFee, total: b.total, paid: b.paid || 0, creditUsed: b.creditUsed || 0, payMethod: b.payMethod, prep: (pest(b.pest) || {}).prep || '',
    warrantyMonths: b.warrantyMonths, warrantyUntil: b.warrantyUntil || null, warrantyUntilLabel: b.warrantyUntil ? fmtDate(b.warrantyUntil, true) : null,
    warrantyActive: !!b.warrantyUntil && b.warrantyUntil >= today, parentId: b.parentId || null,
    reminderLabel: b.slot ? fmtDate(addDays(b.date, -1)) : null, credit: b.credit || null, tracking: track(b),
    canReschedule: b.status === 'booked', movedFrom: b.movedFrom || null,
  };
}
function findBooking(id) { return db().bookings.find((b) => b.id.toLowerCase() === String(id || '').trim().toLowerCase().replace(/^(\d+)$/, 'ak-$1')); }
function sessionMobile(req) {
  const s = db().sessions[req.get('x-akkad-session') || ''];
  return s && s.exp > Date.now() ? s.mobile : null;
}
function authed(req, res, next) {
  const b = findBooking(req.params.id);
  if (!b) return fail(res, 404, 'We could not find that booking.');
  const key = req.get('x-akkad-key') || req.query.k;
  if (key !== b.key && sessionMobile(req) !== b.mobile) return fail(res, 401, 'Please confirm it is you to open this booking.');
  req.booking = refresh(b);
  next();
}
function customerCredit(mobile) {
  const today = dubaiNow().iso;
  return db().bookings.filter((b) => b.mobile === mobile && b.credit && b.credit.amount > 0 && b.credit.until >= today);
}

/* ---------- public content ---------- */
app.get('/api/site', (req, res) => {
  const now = dubaiNow();
  const first = days(1)[0];
  res.json({
    company: C.COMPANY, fees: C.FEES, pests: C.PESTS, why: C.WHY, faq: C.FAQ, googleReviews: C.GOOGLE_REVIEWS,
    emirates: ['Dubai', 'Sharjah', 'Ajman'], demo: DEMO,
    firstDay: first.label, statusClock: fmtClock(new Date(Date.now() - (now.minute % 30) * 60000)),
  });
});
const areaOut = (a) => ({ slug: a.slug, name: a.name, short: a.short, emirate: a.emirate });
app.get('/api/areas', (req, res) => {
  const q = clean(req.query.q, 40).toLowerCase();
  const em = clean(req.query.emirate, 20).toLowerCase();
  let out = [];
  for (const a of C.AREAS) {
    if (em && a.emirate.toLowerCase() !== em) continue;
    if (!q) { out.push({ ...areaOut(a), label: a.name }); continue; }
    if (a.name.toLowerCase().includes(q) || a.short.toLowerCase().includes(q)) out.push({ ...areaOut(a), label: a.name });
    for (const al of a.aliases) if (al.toLowerCase().includes(q)) out.push({ ...areaOut(a), label: al });
  }
  res.json({ areas: out.slice(0, q ? 8 : 40) });
});
app.get('/api/areas/near', (req, res) => {
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (!isFinite(lat) || !isFinite(lng)) return fail(res, 400, 'Location missing.');
  let best = null;
  for (const a of C.AREAS) {
    const km = Math.hypot((a.lat - lat) * 111, (a.lng - lng) * 100);
    if (!best || km < best.km) best = { a, km };
  }
  if (best.km > 25) return res.json({ area: null });
  res.json({ area: areaOut(best.a) });
});
app.get('/api/areas/:slug', (req, res) => {
  const a = area(req.params.slug);
  if (!a) return fail(res, 404, 'We do not know that area yet.');
  const stats = C.areaStats(a);
  const top = pest(stats.topPest);
  res.json({
    area: areaOut(a), stats, topPest: { id: top.id, name: top.name, single: top.single, service: top.service, from: top.from, warrantyMonths: top.warrantyMonths },
    neighborReviews: C.NEIGHBOR_REVIEWS, googleReviews: [...C.GOOGLE_REVIEWS.filter((r) => a.name.includes(r.area)), ...C.GOOGLE_REVIEWS.filter((r) => !a.name.includes(r.area))].slice(0, 5),
  });
});
app.get('/api/slots', (req, res) => res.json({ days: days(Math.min(14, Number(req.query.days) || 5), clean(req.query.except, 12)) }));

/* ---------- inspection and photo requests ---------- */
function newRequest(type, body) {
  const d = db();
  const r = { id: 'REQ-' + ++d.reqSeq, type, createdAt: new Date().toISOString(), ...body };
  d.requests.push(r); store.save();
  return r;
}
app.post('/api/inspections', (req, res) => {
  const mobile = normMobile(req.body.mobile);
  const name = clean(req.body.name, 80), where = clean(req.body.area, 80);
  if (!name) return fail(res, 400, 'Please add a company or contact name.');
  if (!mobile) return fail(res, 400, 'Please enter a valid mobile number.');
  if (!where) return fail(res, 400, 'Please add your area or location.');
  const r = newRequest('inspection', { job: req.body.job === 'amc' ? 'Commercial AMC' : 'Termite control', property: clean(req.body.property, 20), name, mobile, area: where });
  res.json({ id: r.id });
});
app.post('/api/photo-requests', (req, res) => {
  const mobile = normMobile(req.body.mobile);
  const photos = Array.isArray(req.body.photos) ? req.body.photos.slice(0, 6) : [];
  if (!photos.length) return fail(res, 400, 'Please add at least one photo.');
  if (!mobile) return fail(res, 400, 'Please enter a valid mobile number.');
  const dir = path.join(__dirname, 'data', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const p of photos) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(p));
    if (!m) continue;
    const file = crypto.randomBytes(8).toString('hex') + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
    fs.writeFileSync(path.join(dir, file), Buffer.from(m[2], 'base64'));
    files.push(file);
  }
  if (!files.length) return fail(res, 400, 'Those photos could not be read. Please try again.');
  const r = newRequest('photos', { purpose: req.body.purpose === 'identify' ? 'identify' : 'price', description: clean(req.body.description, 600), size: clean(req.body.size, 30), mobile, files });
  res.json({ id: r.id });
});

/* ---------- price and booking ---------- */
function quote(body) {
  const p = pest(body.pest);
  if (!p || p.inspection) throw new Error('This service is priced after an inspection.');
  const pk = p.packages.find((x) => x.id === body.pkg);
  if (!pk) throw new Error('Please choose a package.');
  let price = pk.price, label = pk.label;
  if (pk.sized) {
    const sz = p.sizes[pk.sized].find((s) => s.id === body.size);
    if (!sz) throw new Error('Please choose your home size.');
    price = sz.price; label = `${p.service} · ${C.shortSize(pk.sized, sz.label)}`;
  }
  const express = body.timing === 'express';
  return { p, price, label, express, expressFee: express ? C.FEES.expressNew : 0 };
}
function contact(body) {
  const mobile = normMobile(body.mobile);
  const name = clean(body.name, 60), building = clean(body.building, 80), apt = clean(body.apt, 12);
  if (!name) throw new Error('Please add your name.');
  if (!mobile) throw new Error('Please enter a valid mobile number.');
  if (!building) throw new Error('Please add your building or villa.');
  return { mobile, name, address: { building, apt } };
}
function schedule(body, exceptId) {
  if (body.timing === 'express') return { timing: 'express', date: dubaiNow().iso, slot: null };
  const date = clean(body.date, 10), slot = clean(body.slot, 20);
  if (!slotOpen(date, slot, exceptId)) throw new Error('That time has just been taken. Please pick another slot.');
  return { timing: 'scheduled', date, slot };
}
function create(fields) {
  const d = db();
  const b = { id: 'AK-' + ++d.seq, key: store.token(), createdAt: new Date().toISOString(), status: 'booked', ...fields };
  if (b.timing === 'express') { b.status = 'on_the_way'; b.setOffAt = Date.now(); b.etaMin = C.FEES.etaMin; }
  d.bookings.push(b); store.save();
  return b;
}

app.post('/api/bookings', (req, res) => {
  try {
    const a = area(req.body.area);
    if (!a) throw new Error('Please choose your area first.');
    const q = quote(req.body);
    const who = contact(req.body);
    const when = schedule(req.body);
    const method = req.body.payMethod === 'tabby' ? 'tabby' : 'card';
    let total = q.price + q.expressFee, creditUsed = 0;
    // Akkad credit from a cancelled booking is used only once the customer has proved the number is theirs.
    if (sessionMobile(req) === who.mobile) {
      for (const c of customerCredit(who.mobile)) { const use = Math.min(c.credit.amount, total - creditUsed); c.credit.amount -= use; creditUsed += use; }
    }
    const b = create({ ...who, ...when, kind: 'new', pest: q.p.id, service: q.p.service, label: q.label, price: q.price, expressFee: q.expressFee, total,
      creditUsed, paid: total - creditUsed, payMethod: method, warrantyMonths: q.p.warrantyMonths, areaSlug: a.slug, areaName: a.name, areaShort: a.short });
    res.json({ booking: view(b) });
  } catch (e) { fail(res, 400, e.message); }
});

app.post('/api/warranty/lookup', (req, res) => {
  const b = findBooking(req.body.bookingNo);
  if (!b || b.kind !== 'new') return fail(res, 404, 'We could not find that booking number. Check your receipt or WhatsApp message.');
  refresh(b);
  const today = dubaiNow().iso;
  if (b.status !== 'done') return fail(res, 400, 'This visit has not been completed yet, so its warranty has not started.');
  if (!b.warrantyUntil || b.warrantyUntil < today) return res.status(410).json({ error: `The warranty on ${b.id} ended on ${fmtDate(b.warrantyUntil, true)}.`, ended: true, pest: b.pest });
  res.json({ id: b.id, service: b.service, pest: b.pest, address: maskAddress(b.address), areaName: b.areaName, areaShort: b.areaShort, areaSlug: b.areaSlug, until: fmtDate(b.warrantyUntil, true) });
});
app.post('/api/warranty/bookings', (req, res) => {
  try {
    const src = findBooking(req.body.bookingNo);
    const today = dubaiNow().iso;
    if (!src || src.kind !== 'new' || src.status !== 'done' || !src.warrantyUntil || src.warrantyUntil < today) throw new Error('This booking has no active warranty.');
    const when = schedule(req.body);
    const address = req.body.building ? { building: clean(req.body.building, 80), apt: clean(req.body.apt, 12) } : src.address;
    const fee = when.timing === 'express' ? C.FEES.expressWarranty : 0;
    const b = create({ ...when, mobile: src.mobile, name: src.name, address, kind: 'warranty', parentId: src.id, pest: src.pest, service: src.service,
      label: `Warranty visit · ${src.service.toLowerCase()}`, price: 0, expressFee: fee, total: fee, paid: fee, payMethod: fee ? (req.body.payMethod === 'tabby' ? 'tabby' : 'card') : null,
      areaSlug: src.areaSlug, areaName: src.areaName, areaShort: src.areaShort });
    res.json({ booking: view(b) });
  } catch (e) { fail(res, 400, e.message); }
});

/* ---------- finding a booking safely ---------- */
app.post('/api/auth/send-code', (req, res) => {
  const mobile = normMobile(req.body.mobile);
  if (!mobile) return fail(res, 400, 'Please enter the mobile number you used to book.');
  const d = db();
  let list = d.bookings.filter((b) => b.mobile === mobile);
  if (req.body.bookingNo) {
    const b = findBooking(req.body.bookingNo);
    list = b && b.mobile === mobile ? [b] : [];
  }
  const prev = d.codes[mobile];
  if (prev && Date.now() - prev.sentAt < 20000) return fail(res, 429, 'A code was just sent. Please wait a moment before asking again.');
  const code = String(crypto.randomInt(0, 10000)).padStart(4, '0');
  // The reply is the same whether or not a booking exists, so numbers cannot be probed.
  d.codes[mobile] = { code: list.length ? code : null, sentAt: Date.now(), exp: Date.now() + 10 * 60000, tries: 0 };
  store.save();
  // LIVE: send `code` through the WhatsApp Business API here.
  res.json({ sentTo: maskMobile(mobile), resendIn: 45, demoCode: DEMO && list.length ? code : undefined });
});
app.post('/api/auth/verify', (req, res) => {
  const mobile = normMobile(req.body.mobile);
  const d = db();
  const c = mobile && d.codes[mobile];
  if (!c || c.exp < Date.now()) return fail(res, 400, 'That code has expired. Please ask for a new one.');
  if (++c.tries > 5) { delete d.codes[mobile]; store.save(); return fail(res, 429, 'Too many tries. Please ask for a new code.'); }
  if (!c.code || String(req.body.code) !== c.code) { store.save(); return fail(res, 400, 'That code is not right. Please check your WhatsApp message.'); }
  delete d.codes[mobile];
  const session = store.token(24);
  d.sessions[session] = { mobile, exp: Date.now() + 90 * 86400000 };
  store.save();
  const list = d.bookings.filter((b) => b.mobile === mobile);
  const asked = req.body.bookingNo && findBooking(req.body.bookingNo);
  res.json({ session, bookingId: asked && asked.mobile === mobile ? asked.id : null, count: list.length });
});

// Everything this browser is allowed to see: bookings it made (keys) plus,
// after a WhatsApp code, every booking on that mobile number.
app.post('/api/me', (req, res) => {
  const d = db();
  const mobile = sessionMobile(req);
  const keys = req.body.keys && typeof req.body.keys === 'object' ? req.body.keys : {};
  const mine = d.bookings.filter((b) => (mobile && b.mobile === mobile) || keys[b.id] === b.key).map(view);
  const active = (b) => ['booked', 'on_the_way', 'arrived'].includes(b.status);
  const upcoming = mine.filter(active).sort((a, b) => (a.date + a.id).localeCompare(b.date + b.id));
  const done = mine.filter((b) => b.status === 'done').sort((a, b) => b.date.localeCompare(a.date));
  const warranties = done.filter((b) => b.kind === 'new' && b.warrantyActive && !upcoming.some((u) => u.parentId === b.id));
  const ended = done.filter((b) => b.kind === 'new' && b.warrantyUntil && !b.warrantyActive);
  const credit = mine.filter((b) => b.credit && b.credit.amount > 0).reduce((n, b) => n + b.credit.amount, 0);
  const state = upcoming.length ? 'upcoming' : warranties.length ? 'warranty' : ended.length ? 'ended' : 'none';
  res.json({ state, verified: !!mobile, mobile: mobile ? maskMobile(mobile) : null, upcoming, warranties, past: done, ended, credit: mobile ? credit : 0,
    cancelled: mine.filter((b) => b.status === 'cancelled' && b.credit && b.credit.amount > 0) });
});
app.post('/api/logout', (req, res) => { delete db().sessions[req.get('x-akkad-session') || '']; store.save(); res.json({ ok: true }); });

/* ---------- one booking ---------- */
app.get('/api/bookings/:id', authed, (req, res) => res.json({ booking: view(req.booking) }));
app.post('/api/bookings/:id/reschedule', authed, (req, res) => {
  const b = req.booking;
  try {
    const enRoute = b.status === 'on_the_way';
    if (b.status !== 'booked' && !enRoute) throw new Error('This visit can no longer be moved online. Please call us.');
    if (req.body.timing === 'express') {
      if (enRoute) throw new Error('Your technician is already on the way.');
      const fee = b.kind === 'warranty' ? C.FEES.expressWarranty : C.FEES.expressNew;
      Object.assign(b, { movedFrom: `${fmtDate(b.date)}, ${b.slot}`, timing: 'express', date: dubaiNow().iso, slot: null, expressFee: fee, total: b.total + fee, paid: (b.paid || 0) + fee,
        payMethod: b.payMethod || 'card', status: 'on_the_way', setOffAt: Date.now(), etaMin: C.FEES.etaMin });
    } else {
      let when;
      if (req.body.laterToday) {
        // "Come later today": the technician had set off; the express fee stays paid.
        const slot = clean(req.body.slot, 20);
        if (!enRoute || !laterTodaySlots().includes(slot)) throw new Error('Please pick a time later today.');
        when = { timing: 'scheduled', date: dubaiNow().iso, slot };
      } else when = schedule({ date: req.body.date, slot: req.body.slot }, b.id);
      Object.assign(b, { movedFrom: b.slot ? `${fmtDate(b.date)}, ${b.slot}` : 'Express today', ...when, status: 'booked', setOffAt: null });
    }
    store.save();
    res.json({ booking: view(b) });
  } catch (e) { fail(res, 400, e.message); }
});
function laterTodaySlots() {
  const h = dubaiNow().hour;
  return ['4–6 PM', '6–8 PM', '8–10 PM'].filter((s) => slotStartHour(s) > h);
}
app.get('/api/bookings/:id/later-today', authed, (req, res) => res.json({ slots: laterTodaySlots() }));
app.post('/api/bookings/:id/details', authed, (req, res) => {
  const b = req.booking;
  if (!['booked', 'on_the_way'].includes(b.status)) return fail(res, 400, 'This booking can no longer be changed.');
  if (req.body.building !== undefined) {
    const building = clean(req.body.building, 80);
    if (!building) return fail(res, 400, 'Please add your building or villa.');
    b.address = { building, apt: clean(req.body.apt, 12) };
  }
  if (req.body.note !== undefined) b.note = clean(req.body.note, 300);
  store.save();
  res.json({ booking: view(b) });
});
app.post('/api/bookings/:id/cancel', authed, (req, res) => {
  const b = req.booking;
  if (b.status !== 'booked') return fail(res, 400, 'This visit can no longer be cancelled online. Please call us.');
  b.status = 'cancelled'; b.cancelReason = clean(req.body.reason, 40); b.cancelledAt = new Date().toISOString();
  // No cash refund: what was paid stays as Akkad credit for 90 days.
  const amount = (b.paid || 0) + (b.creditUsed || 0);
  if (amount > 0) b.credit = { amount, until: addDays(dubaiNow().iso, 90), untilLabel: fmtDate(addDays(dubaiNow().iso, 90), true) };
  store.save();
  res.json({ booking: view(b) });
});
// Personal link from a WhatsApp message: opens the booking straight away, no code.
app.get('/api/link/:key', (req, res) => {
  const b = db().bookings.find((x) => x.key === req.params.key);
  if (!b) return fail(res, 404, 'This link is no longer valid.');
  refresh(b);
  if (b.status === 'done' || b.status === 'cancelled') return fail(res, 410, 'This link stopped working after the visit. Use your mobile number to see your bookings.');
  res.json({ id: b.id, key: b.key });
});
// Dispatch hook: the technician sets off for a scheduled visit (starts live tracking).
app.post('/api/ops/bookings/:id/set-off', (req, res) => {
  if (!DEMO && req.get('x-ops-secret') !== process.env.OPS_SECRET) return fail(res, 403, 'Not allowed.');
  const b = findBooking(req.params.id);
  if (!b || b.status !== 'booked') return fail(res, 400, 'Booking is not waiting for a visit.');
  Object.assign(b, { status: 'on_the_way', setOffAt: Date.now(), etaMin: C.FEES.etaMin });
  store.save();
  res.json({ booking: view(b) });
});
app.get('/api/bookings/:id/calendar.ics', authed, (req, res) => {
  const b = req.booking;
  if (!b.slot) return fail(res, 400, 'No scheduled time.');
  const h = slotStartHour(b.slot);
  const stamp = (hour) => new Date(Date.parse(`${b.date}T${String(hour).padStart(2, '0')}:00:00+04:00`)).toISOString().replace(/[-:]|\.\d{3}/g, '');
  res.type('text/calendar').attachment(`akkad-${b.id}.ics`).send(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akkad Pest Control//EN', 'BEGIN:VEVENT', `UID:${b.id}@pestcontrol.ae`,
    `DTSTAMP:${stamp(h)}`, `DTSTART:${stamp(h)}`, `DTEND:${stamp(h + 2)}`, `SUMMARY:Akkad Pest Control visit (${b.id})`, `DESCRIPTION:${b.label}. ${C.COMPANY.phone}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'));
});

app.use('/api', (req, res) => fail(res, 404, 'Not found.'));
app.use((err, req, res, next) => {
  if (!req.path.startsWith('/api')) return next(err);
  fail(res, err.type === 'entity.too.large' ? 413 : 400, err.type === 'entity.too.large' ? 'Those photos are too large. Please send fewer or smaller photos.' : 'We could not read that request.');
});

/* ---------- the website ---------- */
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: DEMO ? 0 : '1h' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Akkad Pest Control website running on http://localhost:${PORT}${DEMO ? '  (demo mode: payments, WhatsApp and dispatch are simulated)' : ''}`));
