// Homepage, area search, the area page, inspection and photo requests.
import { S, save, site, api, route, go, esc, icon, photo, pestTile, on, $, $$, busy, showErr, toast, onLeave } from './core.js';
import { book, foundPopup, homePopup, checkAvailability } from './flows.js';
import { storePage } from './store.js';

/* ---------- homepage: the booking shop, personalised to the customer's area ---------- */
route('/', async () => {
  const page = storePage();
  return {
    title: '', html: page.html, loc: true, bar: false,
    mount(root) {
      page.mount(root);
      setTimeout(homePopup, 350);
    },
  };
});

/* ---------- screen 15: enter your area (Google address search, with our own list as the fallback) ---------- */
route('/area', async (_, q) => ({
  title: 'Enter your area', flow: true, bar: false,
  html: `<div class="flow"><h1>Enter your area</h1>
    ${q.get('far') ? '<p class="note">We could not match your location to a community we serve. Please type it below.</p>' : '<p class="muted">Type your building, street or community and pick it from the list.</p>'}
    <label class="field">${icon('search')}<span class="sr">Building, street or community</span><input id="q" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Building, street or community" autofocus></label>
    <div id="results" class="area-list" aria-live="polite"></div>
    <p class="note powered" id="powered" hidden>Powered by Google</p>
    <button class="btn ghost" id="locate">${icon('pin', 20)}Use my current location</button></div>`,
  mount(root) {
    const out = $('#results', root), input = $('#q', root), powered = $('#powered', root);
    const session = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
    const row = (i, main, small, tag) => `<button class="area-row" data-i="${i}">${icon('pin', 18)}<span class="ar-name">${esc(main)}${small ? `<small>${esc(small)}</small>` : ''}</span>${tag ? `<span class="ar-em">${esc(tag)}</span>` : ''}${icon('right', 16)}</button>`;
    const none = (title, text) => `<div class="card"><h3>${title}</h3><p class="sub">${text}</p><a class="btn ghost" style="margin-top:12px" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></div>`;
    let n = 0, items = [], timer;
    const search = async () => {
      const mine = ++n, text = input.value.trim();
      if (text.length < 2) { items = []; out.innerHTML = ''; powered.hidden = true; return; }
      let fromGoogle = false;
      try {
        if (site.places) {
          const r = await api(`/places?q=${encodeURIComponent(text)}&session=${session}`);
          if (mine !== n) return;
          if (r.google) { fromGoogle = true; items = r.places.map((p) => ({ place: p.id, main: p.main, small: p.secondary })); }
        }
        if (!fromGoogle) {
          const { areas } = await api(`/areas?q=${encodeURIComponent(text)}`);
          if (mine !== n) return;
          items = areas.map((a) => ({ area: { slug: a.slug, name: a.name, short: a.short, emirate: a.emirate }, main: a.label, small: a.label !== a.name ? a.name : '', tag: a.emirate }));
        }
      } catch { if (mine !== n) return; items = []; }
      powered.hidden = !fromGoogle || !items.length;
      out.innerHTML = items.length ? items.map((it, i) => row(i, it.main, it.small, it.tag)).join('')
        : none('We could not find that place', 'Check the spelling, or message us and we will tell you if we cover it.');
    };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 220); });
    onLeave(() => clearTimeout(timer));
    on(out, '[data-i]', (b) => busy(b, async () => {
      const it = items[b.dataset.i];
      if (it.area) return foundPopup(it.area);
      try {
        const r = await api(`/places/${encodeURIComponent(it.place)}?session=${session}`);
        if (r.area) foundPopup(r.area);
        else out.innerHTML = none(`We do not cover ${esc(it.main)} yet`, 'We serve Dubai, Sharjah and Ajman. Message us and we will tell you when a team can come.');
      } catch (e) { toast(e.message); }
    }));
    on(root, '#locate', () => checkAvailability(true));
  },
}));

/* ---------- area pages: the same shop, fixed to one community (one page per area) ---------- */
route('/pest-control/:slug', async ({ slug }) => {
  const d = await api('/areas/' + slug);
  if (!S.area || S.area.slug !== slug) { S.area = d.area; save(); }
  const a = d.area, st = d.stats, top = d.topPest;
  const page = storePage({ area: a, stats: st, top: top.id, neighborReviews: d.neighborReviews, googleReviews: d.googleReviews });
  return {
    title: `Pest control in ${a.name}`, html: page.html, head: 'area', bar: false, loc: false,
    mount(root) {
      page.mount(root);
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
