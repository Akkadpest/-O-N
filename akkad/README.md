# Akkad Pest Control website

Node.js (Express) website built from *Akkad Website Flow v7*: all 56 screens, responsive for phone and desktop.

```bash
cd akkad
npm install
npm start        # http://localhost:3000  (PORT=8080 npm start to change the port)
```

## What is where

| Path | What it holds |
| --- | --- |
| `server.js` | The server and JSON API: areas, slots, prices, bookings, tracking, reschedule, cancel, WhatsApp code login |
| `data/catalog.js` | Everything Akkad edits: company details, services, packages, prices, fees, areas, reviews, FAQ |
| `lib/store.js` | Booking storage (a JSON file, `data/db.json`); replace with a database when dispatch is connected |
| `public/css/styles.css` | All styling, phone first, desktop from 900px |
| `public/js/pages-home.js` | Homepage, area search, area page, inspection and photo requests (screens 1-18) |
| `public/js/pages-book.js` | New booking and warranty call-out (screens 20-32, 37-40) |
| `public/js/pages-manage.js` | Confirmation, live tracking, reschedule, cancel, find my bookings (screens 33-36, 41-56) |
| `public/js/flows.js` | The pop-ups: location, nearby team, new or warranty, booking help, welcome back |

## Adding photos

Every photo slot is a labelled placeholder (`photo('Photo: technician treating a kitchen')`).
Put the image in `public/img/` and pass it as the second argument: `photo('Technician treating a kitchen', '/img/hero.jpg')`.

## Demo mode (default)

Until the real services are connected the site simulates them, and says so on screen:

- **Payment** (Network International, Tabby): no card is charged; confirming creates the booking.
- **WhatsApp**: the 4-digit code is shown on the page instead of being sent.
- **Dispatch**: the van covers the 28 minutes in about 2 minutes (`TRACK_SPEED`), and a scheduled visit has a "technician sets off now" button.

Sample customer for the warranty and "my bookings" flows: mobile `+971 50 123 4567`, booking `AK-10482`.
Delete `data/db.json` to reset all bookings. Set `AKKAD_LIVE=1` to switch the demo behaviour off once the integrations are in.

## Sample content to replace

Marked `sample: true` or "SAMPLE" in `data/catalog.js`: size-by-size prices for pests other than cockroaches,
neighbour and Google reviews, and the per-area figures outside Tecom. The licence line in the footer is still the placeholder text from the design.
