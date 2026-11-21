// Run with: npm test   (starts the server on a spare port with a throwaway data file)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = 3900 + Math.floor(Math.random() * 90);
const B = `http://127.0.0.1:${PORT}`;
const DB = path.join(os.tmpdir(), `akkad-test-${process.pid}.json`);
let server;

const call = async (p, body, headers = {}) => {
  const res = await fetch(B + p, { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json', 'x-akkad': '1', ...headers } : headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, headers: res.headers, data: await res.json().catch(() => null) };
};
const contact = { name: 'Test', mobile: '0507654321', building: 'Test Tower', apt: '12' };
const order = { area: 'barsha-heights-tecom', pest: 'cockroach', pkg: 'apartment', size: 's1', ...contact };

before(async () => {
  server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, AKKAD_DB: DB, AKKAD_HOST: '127.0.0.1', OPS_SECRET: 'test-secret' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(B + '/api/site'); return; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  throw new Error('server did not start');
});
after(() => { server.kill(); fs.rmSync(DB, { force: true }); });

test('pages carry security headers', async () => {
  const res = await fetch(B + '/');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
});

test('files outside the public folder are never served', async () => {
  for (const p of ['/../server.js', '/..%2fserver.js', '/.gitignore', '/data/db.json', '/%2e%2e/data/catalog.js']) {
    const text = await (await fetch(B + p)).text();
    assert.ok(!text.includes('require(') && !text.includes('"bookings"') && !text.includes('node_modules'), p);
  }
});

test('changes are refused without the site header', async () => {
  const res = await fetch(B + '/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(order) });
  assert.equal(res.status, 403);
});

test('the server sets the price and records payment as pending', async () => {
  const { days } = (await call('/api/slots?days=3')).data;
  const r = await call('/api/bookings', { ...order, timing: 'scheduled', date: days[0].iso, slot: days[0].slots[0], price: 1, total: 1 });
  assert.equal(r.status, 200);
  assert.equal(r.data.booking.total, 210, 'cockroach, 1-bed apartment, from the price list');
  assert.equal(r.data.booking.paymentStatus, 'pending');
  const id = r.data.booking.id, key = r.data.booking.key;
  assert.equal((await call(`/api/bookings/${id}`)).status, 401, 'no key, no access');
  assert.equal((await call(`/api/bookings/${id}`, null, { 'x-akkad-key': 'wrong' })).status, 401);
  assert.equal((await call(`/api/bookings/AK-99999`)).status, 401, 'unknown booking looks the same');
  assert.equal((await call(`/api/bookings/${id}`, null, { 'x-akkad-key': key })).status, 200);
  const moved = await call(`/api/bookings/${id}/reschedule`, { date: days[1].iso, slot: days[1].slots[0] }, { 'x-akkad-key': key });
  assert.equal(moved.data.booking.date, days[1].iso);
  const cancelled = await call(`/api/bookings/${id}/cancel`, { reason: 'Other' }, { 'x-akkad-key': key });
  assert.equal(cancelled.data.booking.status, 'cancelled');
  assert.equal(cancelled.data.booking.credit, null, 'nothing was paid, so no credit');
});

test('Tabby adds 7% to the amount due; card adds nothing', async () => {
  const { days } = (await call('/api/slots?days=3')).data;
  const when = { timing: 'scheduled', date: days[2].iso, slot: days[2].slots[0] };
  const tabby = await call('/api/bookings', { ...order, ...when, payMethod: 'tabby', tabbyFee: 0, total: 1 });
  assert.equal(tabby.status, 200);
  assert.equal(tabby.data.booking.tabbyFee, 14.7, '7% of AED 210');
  assert.equal(tabby.data.booking.total, 224.7);
  const fast = await call('/api/bookings', { ...order, timing: 'express', payMethod: 'tabby' });
  assert.equal(fast.data.booking.tabbyFee, 18.13, '7% of AED 210 + AED 49 Schedule fast');
  assert.equal(fast.data.booking.total, 277.13);
  const card = await call('/api/bookings', { ...order, ...when, slot: days[2].slots[1], payMethod: 'something-else' });
  assert.equal(card.data.booking.tabbyFee, 0);
  assert.equal(card.data.booking.total, 210);
});

test('cash on delivery: only for a scheduled visit, never for the one-time visit', async () => {
  const { days } = (await call('/api/slots?days=3')).data;
  const when = { timing: 'scheduled', date: days[1].iso, slot: days[1].slots[1] };
  const ok = await call('/api/bookings', { ...order, ...when, payMethod: 'cod' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.booking.paymentStatus, 'cod');
  assert.equal(ok.data.booking.cashDue, 210);
  assert.equal(ok.data.booking.paid, 0);
  assert.equal(ok.data.booking.tabbyFee, 0);
  assert.equal((await call('/api/bookings', { ...order, timing: 'express', payMethod: 'cod' })).status, 400, 'Schedule fast must be paid online');
  assert.equal((await call('/api/bookings', { ...order, ...when, slot: days[1].slots[2], pest: 'general-once', pkg: 'apartment', size: undefined, payMethod: 'cod' })).status, 400, 'the one-time visit must be paid online');
  assert.equal((await call('/api/bookings', { ...order, ...when, slot: days[1].slots[2], pest: 'general-once', pkg: 'apartment', size: undefined, payMethod: 'card' })).status, 200);
});

test('made-up slots, sizes and areas are rejected', async () => {
  assert.equal((await call('/api/bookings', { ...order, timing: 'scheduled', date: '2020-01-01', slot: '2–4 PM' })).status, 400);
  assert.equal((await call('/api/bookings', { ...order, timing: 'express', size: 's99' })).status, 400);
  assert.equal((await call('/api/bookings', { ...order, timing: 'express', area: 'nowhere' })).status, 400);
  assert.equal((await call('/api/bookings', { ...order, timing: 'express', pest: 'termites' })).status, 400);
});

test('a WhatsApp code opens the bookings on that number, in an HttpOnly cookie', async () => {
  const mobile = '+971501234567';
  const sent = await call('/api/auth/send-code', { mobile });
  assert.equal(sent.status, 200);
  assert.equal((await call('/api/auth/verify', { mobile, code: sent.data.demoCode === '0000' ? '1111' : '0000' })).status, 400);
  const ok = await call('/api/auth/verify', { mobile, code: sent.data.demoCode });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.session, undefined, 'the session is never handed to page scripts');
  const cookie = ok.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/);
  const mine = await call('/api/me', { keys: {} }, { cookie: cookie.split(';')[0] });
  assert.equal(mine.data.verified, true);
  assert.ok(mine.data.past.some((b) => b.id === 'AK-10482'));
  assert.ok(!JSON.stringify(mine.data).includes('Sheikha Noora'), 'addresses stay masked');
  assert.equal((await call('/api/auth/verify', { mobile, code: sent.data.demoCode })).status, 400, 'a code works once');
  const nobody = await call('/api/auth/send-code', { mobile: '+971509999999' });
  assert.equal(nobody.status, 200); assert.equal(nobody.data.demoCode, undefined);
});

test('inspection requests need the termite stage and area, AMC needs a company', async () => {
  const base = { name: 'Sam', mobile: '0501112223', area: 'Tecom' };
  assert.equal((await call('/api/inspections', { ...base, job: 'termite', stage: 'Pre-construction' })).status, 400);
  assert.equal((await call('/api/inspections', { ...base, job: 'termite', stage: 'Later', sqm: '450' })).status, 400);
  assert.equal((await call('/api/inspections', { ...base, job: 'termite', stage: 'Post-construction', sqm: '4e5' })).status, 400);
  assert.equal((await call('/api/inspections', { ...base, job: 'termite', stage: 'Pre-construction', sqm: '450', property: 'Villa' })).status, 200);
  assert.equal((await call('/api/inspections', { ...base, job: 'amc', pests: ['Rodents'] })).status, 400);
  assert.equal((await call('/api/inspections', { ...base, job: 'amc', company: 'Cafe LLC', pests: ['Rodents', '<b>'], frequency: 'Monthly', sites: '1' })).status, 200);
});

test('oversized requests are refused', async () => {
  const r = await call('/api/inspections', { name: 'x'.repeat(200000), mobile: '0501112223', area: 'Tecom' });
  assert.equal(r.status, 413);
});

test('guessing booking numbers is cut off', async () => {
  let last;
  for (let i = 0; i < 10; i++) last = await call('/api/warranty/lookup', { bookingNo: 'AK-2' + i });
  assert.equal(last.status, 429);
});

test('chat: a customer can message, only an agent with the secret can read or reply', async () => {
  assert.equal((await call('/api/chat/start', { area: 'JLT' })).status, 400, 'no chat without a mobile number');
  assert.equal((await call('/api/chat/start', { area: 'JLT', mobile: '12345' })).status, 400);
  const start = await call('/api/chat/start', { area: 'JLT', name: 'Sam', mobile: '050 111 2223' });
  const chat = { 'x-akkad-chat': start.data.token };
  const sent = await call('/api/chat/messages', { text: 'Do you treat ants?<script>' }, chat);
  assert.equal(sent.status, 200);
  assert.equal(sent.data.messages[0].from, 'customer');
  assert.ok(!sent.data.messages[0].text.includes('<'), 'markup is stripped');
  assert.equal(sent.data.messages[1].from, 'system');
  assert.equal((await call('/api/chat', null, { 'x-akkad-chat': 'x'.repeat(40) })).status, 404, 'another token sees nothing');
  assert.equal((await call('/api/ops/chats')).status, 403);
  assert.equal((await call('/api/ops/chats', null, { 'x-ops-secret': 'wrong' })).status, 403);
  const inbox = await call('/api/ops/chats', null, { 'x-ops-secret': 'test-secret' });
  assert.equal(inbox.status, 200);
  assert.equal(inbox.data.chats[0].mobile, '+971501112223');
  const id = inbox.data.chats[0].id;
  // an agent tool is not the website: it sends the secret, not the website header
  const reply = await fetch(`${B}/api/ops/chats/${id}/reply`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-ops-secret': 'test-secret' }, body: JSON.stringify({ text: 'Yes, from AED 210.' }) });
  assert.equal(reply.status, 200);
  assert.equal((await fetch(`${B}/api/ops/chats/${id}/reply`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"text":"x"}' })).status, 403);
  const after = await call('/api/chat?after=2', null, chat);
  assert.equal(after.data.messages[0].from, 'agent');
  assert.equal(after.data.agentConnected, true);
});

test('bed bugs in a villa: bedroom price plus AED 30 per mattress, decided by the server', async () => {
  const base = { ...order, pest: 'bedbugs', pkg: 'villa', size: 's2', timing: 'express' };
  const r = await call('/api/bookings', { ...base, mattresses: 4 });
  assert.equal(r.status, 200);
  assert.equal(r.data.booking.price, 525 + 4 * 30);
  assert.match(r.data.booking.label, /3-bed villa · 4 mattresses/);
  assert.equal((await call('/api/bookings', base)).status, 400, 'mattress count is required');
  assert.equal((await call('/api/bookings', { ...base, mattresses: 500 })).status, 400);
});

test('fixed-price services follow the price list', async () => {
  const r = await call('/api/bookings', { ...order, pest: 'mosquitoes', pkg: 'fogging', size: undefined, timing: 'express' });
  assert.equal(r.data.booking.price, 315);
  assert.equal(r.data.booking.warrantyMonths, 0);
});
