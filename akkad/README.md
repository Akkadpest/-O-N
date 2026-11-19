# Akkad Pest Control website

Node.js website built from *Akkad Website Flow v7*: all 56 screens, responsive for phone and desktop.

It runs **offline**: there are no packages to install and nothing is loaded from the internet (the font is bundled).
The only thing the computer needs is [Node.js](https://nodejs.org) 18 or newer, installed once.

- **Windows:** double-click `start-windows.bat`
- **Mac:** double-click `start-mac.command`
- **Any system:**

```bash
node server.js   # http://localhost:3000  (PORT=8080 node server.js to change the port)
```

Offline, the links that leave the site (WhatsApp, Google reviews) and location detection need a connection; choose your area by typing it instead.

## What is where

| Path | What it holds |
| --- | --- |
| `server.js` | The server and JSON API: areas, slots, prices, bookings, tracking, reschedule, cancel, WhatsApp code login |
| `data/catalog.js` | Everything Akkad edits: company details, services, packages, prices, fees, areas, reviews, FAQ |
| `lib/mini.js` | The small built-in web server layer (routes, JSON, static files) that replaces Express |
| `lib/store.js` | Booking storage (a JSON file, `data/db.json`); replace with a database when dispatch is connected |
| `public/css/styles.css` | All styling, phone first, desktop from 900px |
| `public/js/pages-home.js` | Homepage, area search, area page, inspection and photo requests (screens 1-18) |
| `public/js/pages-book.js` | New booking and warranty call-out (screens 20-32, 37-40) |
| `public/js/pages-manage.js` | Confirmation, live tracking, reschedule, cancel, find my bookings (screens 33-36, 41-56) |
| `public/js/store.js` | The shop: service list, search, cart and the size and timing choices |
| `public/js/pages-info.js` | Services, About, Commercial, Contact and the policy pages |
| `data/content.js` | The text for the service and information pages |
| `public/js/flows.js` | The pop-ups: location, nearby team, new or warranty, booking help, welcome back |

## Adding photos

Every photo slot is a labelled placeholder (`photo('Photo: technician treating a kitchen')`).
Put the image in `public/img/` and pass it as the second argument: `photo('Technician treating a kitchen', '/img/hero.jpg')`.

## What is still pending

Everything on the site works except the connections to outside services, which are marked in `server.js`:

- **Payment** (Network International, Tabby): not connected. Confirming books the visit, nothing is charged, and the amount is recorded and shown as **payment pending**, never as paid. Connect it in `create()` (search for `PAYMENT PENDING`).
- **WhatsApp**: the 4-digit code is shown on the page instead of being sent (search for `LIVE: send`). The reminder is a preview page.
- **Dispatch**: the van covers the 28 minutes in about 2 minutes (`TRACK_SPEED`), and a scheduled visit has a "technician sets off now" button. Real dispatch calls `POST /api/ops/bookings/:id/set-off` with the `x-ops-secret` header.

Sample customer for the warranty and "my bookings" flows: mobile `+971 50 123 4567`, booking `AK-10482`.
Delete `data/db.json` to reset all bookings.

## Security

- Strict Content-Security-Policy and the usual protective headers on every response; no inline scripts, nothing loaded from other sites.
- The login session is an `HttpOnly`, `SameSite=Strict` cookie; only a hash of it is stored. Codes are hashed, single-use, expire in 10 minutes and allow 5 tries.
- Every change needs a header that other websites cannot send, so a page elsewhere cannot act for a customer.
- Prices, slots and totals are always decided by the server; the browser's numbers are ignored.
- A booking opens only with its own key or after a WhatsApp code; unknown and forbidden bookings answer the same way.
- Rate limits on every endpoint, with a short lock-out after repeated wrong booking numbers, codes or links.
- Addresses and mobile numbers are masked in every reply. Uploaded photos are size-limited and checked to be real images.

Settings for going live: `AKKAD_LIVE=1` (turn demo behaviour off), `AKKAD_HTTPS=1` (Secure cookies and HSTS), `TRUST_PROXY=1` (behind a reverse proxy), `OPS_SECRET` (dispatch), `PORT`.

One limit that comes from the approved flow: a warranty visit can be requested with the booking number alone (screen 37), so that step is protected by lock-outs rather than by a code.

```bash
npm test   # API and security checks
```

## Hosting on AWS Lightsail

`.github/workflows/deploy-akkad.yml` deploys on every push: it runs the tests, copies this folder to the server and runs `deploy/server-setup.sh` there.
It needs one repository secret, `LIGHTSAIL_SSH_KEY` (the contents of the Lightsail `.pem` file). Never commit the key itself.

The script installs Node.js and nginx, runs the site as a locked-down `akkad` service on `127.0.0.1:3000` behind nginx on port 80,
and keeps bookings in `/var/lib/akkad` so updates never erase them. Settings live in `/etc/akkad.env`.
It refuses to run if another website already answers on the server (override with `FORCE=1`).

To install by hand instead, copy this folder to the server and run `sudo bash deploy/server-setup.sh`.

For a domain with https: point the domain at the server, run `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain`,
then add `AKKAD_HTTPS=1` to `/etc/akkad.env` and `sudo systemctl restart akkad`.

## Sample content to replace

Marked `sample: true` or "SAMPLE" in `data/catalog.js`: size-by-size prices for pests other than cockroaches,
neighbour and Google reviews, and the per-area figures outside Tecom. The licence line in the footer is still the placeholder text from the design.
