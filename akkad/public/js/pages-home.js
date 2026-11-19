// Homepage, area search, the area page, inspection and photo requests.
import { S, save, site, api, route, go, esc, icon, photo, pestTile, on, $, $$, busy, showErr, toast } from './core.js';
import { book, foundPopup, homePopup } from './flows.js';
import { storePage } from './store.js';

/* ---------- office location and contact details ---------- */
const mapsLink = (c) => c.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapsQuery || c.address)}`;

// Drawn map: always works, even with no internet. Replaced by Google Maps when online.
const officeSvg = (c) => `
  <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map: Akkad office at ${esc(c.address)}">
    <rect width="600" height="340" fill="#eef3ea"/>
    ${[[20, 20, 120, 70], [160, 20, 150, 70], [330, 20, 120, 50], [470, 20, 110, 90], [20, 210, 110, 110], [150, 240, 150, 80], [420, 230, 160, 90], [20, 110, 100, 80]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#e1eada"/>`).join('')}
    <path d="M-20 300 620 60" stroke="#f3d48f" stroke-width="30"/>
    <path d="M-20 300 620 60" stroke="#fff" stroke-width="2" stroke-dasharray="14 12"/>
    <path d="M140 -10 230 350M330 -10 380 350M-10 200 600 150" stroke="#fff" stroke-width="12"/>
    <rect x="236" y="96" width="92" height="60" rx="6" fill="#cfe1c2"/>
    <path d="M440 120c30-14 70-6 100 10v60c-34-8-70-4-100 14z" fill="#cde8bd"/>
    <text x="490" y="168" text-anchor="middle" font-size="14" fill="#5c7a4a">The Greens</text>
    <text x="20" y="270" font-size="14" font-weight="600" fill="#8a6a1c" transform="rotate(-20.5 20 270)">Sheikh Zayed Road</text>
    <g transform="translate(282 124)">
      <circle r="34" fill="rgba(60,122,34,.18)"/>
      <path d="M0 0c-14-18-22-28-22-40a22 22 0 0 1 44 0c0 12-8 22-22 40z" fill="#3c7a22" stroke="#fff" stroke-width="3"/>
      <circle cy="-40" r="8" fill="#fff"/>
    </g>
    <rect x="160" y="168" width="244" height="58" rx="10" fill="#fff" stroke="#3c7a22" stroke-width="2"/>
    <text x="282" y="192" text-anchor="middle" font-size="17" font-weight="700" fill="#1c2a16">Akkad Pest Control</text>
    <text x="282" y="213" text-anchor="middle" font-size="13" fill="#4b5745">Sheikha Noora Tower, Office 403</text>
  </svg>`;

const contactSection = (c) => `
  <section class="sec tint" id="contact"><div class="wrap">
    <h2>Visit or contact us</h2>
    <div class="contact">
      <div class="office-map" data-map>${officeSvg(c)}<span class="map-tag">${icon('pin', 18)}Barsha Heights (Tecom)</span></div>
      <div class="stack contact-info">
        <div class="card ic-row">${icon('pin', 28)}<div class="grow"><h3>Our office</h3><p class="sub">${esc(c.building || c.address)}<br>${esc(c.district || '')}</p></div></div>
        <div class="card ic-row">${icon('phone', 28)}<div class="grow"><h3>Call us</h3><p class="sub"><a class="link" href="${c.phoneHref}">${esc(c.phone)}</a></p></div></div>
        <div class="card ic-row">${icon('chat', 28)}<div class="grow"><h3>WhatsApp</h3><p class="sub"><a class="link" href="${c.whatsapp}" target="_blank" rel="noopener">Message us on ${esc(c.phone)}</a></p></div></div>
        ${c.email ? `<div class="card ic-row">${icon('doc', 28)}<div class="grow"><h3>Email</h3><p class="sub"><a class="link" href="mailto:${esc(c.email)}">${esc(c.email)}</a></p></div></div>` : ''}
        ${c.hours ? `<div class="card ic-row">${icon('calendar', 28)}<div class="grow"><h3>Opening hours</h3><p class="sub">${esc(c.hours)}</p></div></div>` : ''}
        <div class="card ic-row">${icon('truck', 28)}<div class="grow"><h3>We come to you</h3><p class="sub">Homes and businesses across Dubai, Sharjah and Ajman.</p></div></div>
      </div>
    </div>
  </div></section>`;

// Resolves only when the internet is reachable (the drawn maps stay otherwise).
let onlineCheck;
function online() {
  if (!navigator.onLine) return Promise.reject(new Error('offline'));
  if (!onlineCheck) {
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 4000);
    onlineCheck = fetch('https://www.google.com/generate_204', { mode: 'no-cors', signal: ctl.signal, cache: 'no-store' });
    onlineCheck.catch(() => { onlineCheck = null; });
  }
  return onlineCheck;
}

// Swap the drawn map for live Google Maps only if the internet is reachable.
function mountOfficeMap(root, c) {
  const box = root.querySelector('[data-map]');
  if (!box) return;
  online().then(() => {
    const f = document.createElement('iframe');
    f.title = 'Akkad office on Google Maps';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = `https://www.google.com/maps?q=${encodeURIComponent(c.mapsQuery || c.address)}&z=15&output=embed`;
    f.onload = () => box.classList.add('map-on');
    box.appendChild(f);
  }).catch(() => {});
}

/* ---------- homepage: the booking shop, personalised to the customer's area ---------- */
route('/', async () => {
  const c = site.company;
  const page = storePage();
  return {
    title: '', html: page.html + contactSection(c), loc: true, bar: false,
    mount(root) {
      page.mount(root);
      mountOfficeMap(root, c);
      setTimeout(homePopup, 350);
    },
  };
});

/* ---------- screen 15: enter your area ---------- */
route('/area', async (_, q) => {
  const emirate = q.get('emirate') || '';
  return {
    title: 'Enter your area', flow: true, bar: false,
    html: `<div class="flow"><h1>${emirate ? 'Choose your community in ' + esc(emirate) : 'Enter your area'}</h1>
      ${q.get('far') ? '<p class="note">We could not match your location to a community we serve. Please type it below.</p>' : ''}
      <label class="field">${icon('search')}<span class="sr">Community or tower</span><input id="q" autocomplete="off" placeholder="Community or tower name" autofocus></label>
      <div class="chips">${['', ...site.emirates].map((e) => `<a class="chip ${e === emirate ? 'on' : ''}" href="/area${e ? '?emirate=' + e : ''}" style="text-decoration:none;${e === emirate ? '' : 'color:inherit'}">${e || 'All'}</a>`).join('')}</div>
      <div id="results" class="area-list"></div><p class="note">Can't see your area? Type a community or tower name.</p></div>`,
    mount(root) {
      const out = $('#results', root);
      let n = 0;
      const search = async () => {
        const mine = ++n;
        const { areas } = await api(`/areas?q=${encodeURIComponent($('#q', root).value.trim())}&emirate=${encodeURIComponent(emirate)}`);
        if (mine !== n) return;
        out.innerHTML = areas.length ? areas.map((a, i) => `<button class="area-row" data-i="${i}">${icon('pin', 18)}<span class="ar-name">${esc(a.label)}${a.label !== a.name ? `<small>${esc(a.name)}</small>` : ''}</span><span class="ar-em">${esc(a.emirate)}</span>${icon('right', 16)}</button>`).join('')
          : `<div class="card"><h3>We could not find that area</h3><p class="sub">Check the spelling, or message us and we will tell you if we cover it.</p><a class="btn ghost" style="margin-top:12px" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></div>`;
        out.areas = areas;
      };
      $('#q', root).addEventListener('input', search);
      on(out, '[data-i]', (b) => { const a = out.areas[b.dataset.i]; foundPopup({ slug: a.slug, name: a.name, short: a.short, emirate: a.emirate }); });
      search();
    },
  };
});

/* ---------- area pages: the same shop, fixed to one community (one page per area) ---------- */
route('/pest-control/:slug', async ({ slug }) => {
  const d = await api('/areas/' + slug);
  if (!S.area || S.area.slug !== slug) { S.area = d.area; save(); }
  const a = d.area, st = d.stats, top = d.topPest;
  const page = storePage({ area: a, stats: st, top: top.id, neighborReviews: d.neighborReviews, googleReviews: d.googleReviews });
  return {
    title: `Pest control in ${a.name}`, html: page.html + contactSection(site.company), head: 'area', bar: false, loc: false,
    mount(root) {
      page.mount(root);
      mountOfficeMap(root, site.company);
    },
  };
});

/* ---------- screens 9-10: termite control or commercial AMC, inspection first ---------- */
route('/inspection', async (_, q) => ({
  title: 'Termite control or commercial AMC', flow: true,
  html: `<div class="flow"><h1>Termite control or commercial AMC</h1>
    <div class="card warn"><h3 class="ic-row" style="gap:8px">${icon('info', 24)}Inspection required</h3><p style="margin-top:8px">These jobs are priced after we see the site. Akkad's operations team will call you to arrange it.</p></div>
    <div class="chips" id="job"><button class="chip ${q.get('job') === 'amc' ? '' : 'on'}" data-v="termite">Termite control</button><button class="chip ${q.get('job') === 'amc' ? 'on' : ''}" data-v="amc">Commercial AMC</button></div>
    <p class="muted">Property type</p>
    <div class="chips" id="prop">${['Villa', 'Restaurant', 'Office', 'Building', 'Warehouse'].map((p, i) => `<button class="chip ${(q.get('job') === 'amc' ? i === 1 : i === 0) ? 'on' : ''}" data-v="${p}">${p}</button>`).join('')}</div>
    <form class="form-grid" novalidate>
      <label class="field">${icon('doc')}<span class="sr">Company or contact name</span><input name="name" placeholder="Company or contact name" autocomplete="name"></label>
      <label class="field">${icon('phone')}<span class="sr">Mobile number</span><input name="mobile" type="tel" inputmode="tel" placeholder="Mobile number" autocomplete="tel"></label>
      <label class="field">${icon('pin')}<span class="sr">Area or location</span><input name="area" placeholder="Area or location" value="${esc(S.area ? S.area.name : '')}"></label>
      <p class="err"></p><button class="btn">Request inspection</button>
    </form>
    <a class="btn ghost" href="/photos">${icon('camera', 22)}Send photos for a price instead</a></div>`,
  mount(root) {
    on(root, '.chips .chip', (b) => $$('.chip', b.parentNode).forEach((c) => c.classList.toggle('on', c === b)));
    $('form', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      busy($('form .btn', root), async () => {
        try {
          const r = await api('/inspections', { job: $('#job .on', root).dataset.v, property: $('#prop .on', root).dataset.v, name: f.get('name'), mobile: f.get('mobile'), area: f.get('area') });
          go('/inspection/received/' + r.id);
        } catch (err) { showErr(root, err); }
      });
    });
  },
}));

const nextSteps = (steps) => `<h2>What happens next</h2><ol class="next">${steps.map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol>
  <div class="row"><a class="btn ghost" href="${site.company.phoneHref}">Call us</a><a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>`;

route('/inspection/received/:id', async ({ id }) => ({
  title: 'Request received', flow: true,
  html: `<div class="flow"><span class="pill lg">${icon('check', 22)}Request received · ${esc(id)}</span>
    <h1 class="big">Our operations team will call you</h1>
    <p style="font-size:16px">They call from ${site.company.phone} to agree an inspection time that suits you.</p>
    ${nextSteps([['Operations team calls you', 'Confirms your needs and books the visit.'], ['Site inspection', 'Our engineer checks the site, finds the cause and measures the area.'], ['Written quotation', 'Price and scope sent on WhatsApp and email.'], ['You approve, we start', 'Treatment or AMC schedule begins on your date.']])}</div>`,
}));

/* ---------- screens 11-12: send photos and get a price on WhatsApp ---------- */
route('/photos', async (_, q) => {
  const identify = q.get('mode') === 'identify';
  return {
    title: identify ? 'Send a photo' : 'Send photos for a price', flow: true,
    html: `<div class="flow"><h1 class="ic-row" style="gap:10px">${icon('camera', 28)}${identify ? "Not sure what it is? Send a photo" : 'Send photos for a price'}</h1>
      <p class="muted">${identify ? 'Take a clear photo of the pest or the damage. Our team identifies it free and replies on WhatsApp.' : 'Take clear photos of the problem areas. Our team will price it from the photos.'}</p>
      <div id="thumbs" class="chips"></div>
      <label class="card center" style="border-style:dashed;border-color:var(--green);cursor:pointer;display:block;color:var(--green);font-weight:700">${icon('camera', 34)}<br>Add photo<input id="file" type="file" accept="image/*" multiple hidden></label>
      <label class="field" style="align-items:flex-start"><span class="sr">Describe what you see</span><textarea name="description" placeholder="Describe what you see: ${identify ? 'small brown insects near the kitchen sink at night' : 'mud tubes near the garden wall and damaged door frame'}"></textarea></label>
      ${identify ? '' : `<p class="muted">Approximate size</p><div class="chips" id="size"><button class="chip" data-v="Under 2,000 sq ft">Under 2,000 sq ft</button><button class="chip on" data-v="2,000–5,000 sq ft">2,000–5,000</button><button class="chip" data-v="Over 5,000 sq ft">Over 5,000</button></div>`}
      <label class="field">${icon('phone')}<span class="sr">Mobile number</span><input name="mobile" type="tel" inputmode="tel" placeholder="Mobile number" autocomplete="tel"></label>
      <p class="err"></p><button class="btn" id="send">Send photos</button>
      <p class="note center">${identify ? 'We reply on WhatsApp, usually within the hour.' : 'If photos are not enough, we will arrange an inspection.'}</p></div>`,
    mount(root) {
      const photos = [];
      const paint = () => { $('#thumbs', root).innerHTML = photos.map((p, i) => `<button class="photo" data-rm="${i}" title="Remove" style="width:120px;min-height:100px;border:0;background-image:url(${p})"></button>`).join(''); };
      $('#file', root).addEventListener('change', async (e) => {
        for (const file of [...e.target.files].slice(0, 6 - photos.length)) {
          try { photos.push(await shrink(file)); } catch { toast('That photo could not be read.'); }
        }
        e.target.value = ''; paint();
      });
      on(root, '[data-rm]', (b) => { photos.splice(b.dataset.rm, 1); paint(); });
      on(root, '#size .chip', (b) => $$('#size .chip', root).forEach((c) => c.classList.toggle('on', c === b)));
      on(root, '#send', (btn) => busy(btn, async () => {
        try {
          const r = await api('/photo-requests', { photos, purpose: identify ? 'identify' : 'price', description: $('textarea', root).value, size: identify ? '' : $('#size .on', root).dataset.v, mobile: $('[name=mobile]', root).value });
          go(`/photos/received/${r.id}${identify ? '?mode=identify' : ''}`);
        } catch (err) { showErr(root, err); }
      }));
    },
  };
});
// Photos are resized in the browser so uploads stay small on mobile data.
function shrink(file) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1400 / Math.max(img.width, img.height));
      const cv = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * k), height: Math.round(img.height * k) });
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src); ok(cv.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = no; img.src = URL.createObjectURL(file);
  });
}
route('/photos/received/:id', async ({ id }, q) => ({
  title: 'Photos received', flow: true,
  html: `<div class="flow"><span class="pill lg">${icon('check', 22)}Photos received · ${esc(id)}</span>
    <h1 class="big">Our team is reviewing your photos</h1>
    <p style="font-size:16px">${q.get('mode') === 'identify' ? 'You will hear from us on WhatsApp with what it is and what to do about it.' : 'You will get the price on WhatsApp. No visit is needed unless the photos leave questions.'}</p>
    ${nextSteps([['Team reviews your photos', 'An engineer checks the problem and the area.'], ['We call or WhatsApp', 'Only if we need more details.'], ['Price sent on WhatsApp', 'With the treatment plan and warranty.'], ['Inspection if needed', 'Some sites still need a visit before we start.']])}</div>`,
}));

/* ---------- guide ---------- */
// Numbered steps joined by a line; 'tips' style shows a check icon instead of the number.
const gsteps = (items, kind = '') => `<ol class="gsteps ${kind}">${items.map(([ic, t, d], i) => `
  <li><span class="gs-n">${kind === 'tips' ? icon(ic, 18) : i + 1}</span><div class="gs-body"><h3>${kind === 'tips' ? '' : icon(ic, 20)}${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>`;

route('/guide', async () => ({
  title: 'Pest control in Dubai: what to expect', bar: true,
  html: `<div class="flow"><h1 class="big">Pest control in Dubai: what to expect</h1>
    <p class="muted">A short guide in plain words.</p>
    <h2>Common pests in UAE homes</h2><p>Cockroaches are the most common call-out, especially in kitchens and drains during the warmer months. Bed bugs travel in luggage and furniture. Ants, rodents, mosquitoes and flies follow food, water and gaps in doors and pipes. Termites attack wood and need a site survey.</p>
    <div class="pests">${site.pests.filter((p) => !p.commercial).map((p) => pestTile(p)).join('')}</div>
    <h2>How treatment works</h2>
    ${gsteps([
      ['search', 'Inspect', 'The technician checks first to find where the pests come from.'],
      ['bug', 'Treat', 'Dubai Municipality-approved products: gel in hidden places, spray only where it is needed.'],
      ['doc', 'Explain', 'Before leaving, he shows what was done and what to expect over the next days.'],
      ['shield', 'Warranty starts', 'If the same pest comes back during your warranty, we return free.'],
    ])}
    <h2>How to keep them away</h2>
    ${gsteps([
      ['tick', 'Keep food sealed', 'Store food in closed containers and wipe crumbs and spills the same day.'],
      ['tick', 'Empty bins daily', 'Use bins with lids and take the rubbish out every evening.'],
      ['tick', 'Fix dripping taps', 'Pests need water. Dry sinks and fix leaks under the kitchen and bathroom.'],
      ['tick', 'Close the gaps', 'Seal gaps around pipes, doors and windows, where pests get in.'],
    ], 'tips')}
    <div class="card on guide-note ic-row">${icon('shield', 26)}<p>Seen them again? If you are under warranty, <a href="/warranty">book a free visit</a>.</p></div>
    <button class="btn" data-book>Book now${icon('arrow', 18)}</button></div>`,
  mount(root) { on(root, '[data-p]', (b) => { const p = site.pests.find((x) => x.id === b.dataset.p); if (p.inspection) go('/inspection'); else { S.draft = { ...S.draft, preset: p.id }; save(); book(); } }); },
}));
