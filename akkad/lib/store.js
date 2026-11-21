// Small JSON-file store. Swap for a real database when connecting dispatch.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE = process.env.AKKAD_DB || path.join(__dirname, '..', 'data', 'db.json');
const token = (n = 18) => crypto.randomBytes(n).toString('base64url');

function seed() {
  // Two finished jobs so the warranty and "past visits" flows can be tried:
  // booking AK-10482, mobile +971 50 123 4567.
  const mobile = '+971501234567';
  const address = { building: 'Sheikha Noora Tower', apt: '403' };
  return {
    seq: 10482,
    reqSeq: 2040,
    bookings: [
      { id: 'AK-10311', mobile, name: 'Sample customer', address, areaSlug: 'barsha-heights-tecom', areaName: 'Barsha Heights (Tecom)', areaShort: 'Tecom',
        kind: 'new', pest: 'ants', service: 'Ant control', label: 'Ant control · 1-bed apt', price: 230, expressFee: 0, total: 230, payMethod: 'card',
        timing: 'scheduled', date: '2026-06-12', slot: '2–4 PM', status: 'done', warrantyMonths: 3, warrantyUntil: '2026-09-12', createdAt: '2026-06-10T08:00:00Z', key: token() },
      { id: 'AK-10482', mobile, name: 'Sample customer', address, areaSlug: 'barsha-heights-tecom', areaName: 'Barsha Heights (Tecom)', areaShort: 'Tecom',
        kind: 'new', pest: 'cockroach', service: 'Cockroach control', label: 'Cockroach control · 1-bed apt', price: 179, expressFee: 18, total: 197, payMethod: 'card',
        timing: 'express', date: '2026-11-03', slot: null, status: 'done', warrantyMonths: 6, warrantyUntil: '2027-05-03', createdAt: '2026-11-03T10:00:00Z', key: token() },
    ],
    requests: [],
    sessions: {},
    codes: {},
  };
}

let db;
function load() {
  if (db) return db;
  try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { db = seed(); save(); }
  return db;
}
let timer;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE + '.tmp', JSON.stringify(db, null, 1), { mode: 0o600 }); // customer data: owner-only
      fs.renameSync(FILE + '.tmp', FILE);
    } catch (e) { console.error('Could not save data:', e.message); }
  }, 50);
}

module.exports = { load, save, token };
