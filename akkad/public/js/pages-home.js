// Homepage, area search, the area page, inspection and photo requests.
import { S, save, site, me, api, route, go, esc, icon, stars, photo, sliderHtml, on, $, $$, busy, showErr, onLeave, toast } from './core.js';
import { book, foundPopup, teamPopup, teamSeen, homePopup, warrantyEntry, areaUrl } from './flows.js';

const checkBtn = (cls = '') => `<button class="btn ${cls}" data-check><span class="live"></span>Check availability</button>`;
const googleCard = (r) => `<article class="card rev"><div class="who"><span class="av">${esc(r.initials)}</span><div><b>${esc(r.name)}</b><small>${esc(r.when)} · ${esc(r.area)}</small></div><span class="gl" aria-label="Google review">G</span></div>${stars(r.stars)}<blockquote>"${esc(r.text)}"</blockquote></article>`;
const googleBlock = (list, title, count) => `
  <div class="rev-head"><h2 class="sec-h">${title}</h2><span></span></div>
  <div class="card score" style="margin:14px 0"><b>${site.company.rating}</b>${stars(5)}<span>${count || 'Google reviews'}</span></div>
  ${sliderHtml(list.map(googleCard), { arrows: 'dots' })}
  <a class="btn ghost" style="margin-top:14px" href="${site.company.googleReviewsUrl}" target="_blank" rel="noopener">Read all reviews on Google</a>`;

const uaeMap = () => `
  <svg class="uae" viewBox="0 0 600 400" role="img" aria-label="Map of Dubai, Sharjah and Ajman">
    <rect width="600" height="400" fill="#dcebf5"/>
    <text class="sea" x="38" y="104">Arabian Gulf</text>
    <path class="em" data-em="Dubai" d="M0 340 140 262 258 188 300 400H0z"/>
    <path class="em" data-em="Sharjah" d="M258 188 345 128 425 80 525 400H300z"/>
    <path class="em" data-em="Ajman" d="M425 80 500 30 600 0V400H525z"/>
    ${[['Dubai', 155, 315], ['Sharjah', 370, 192], ['Ajman', 530, 106]].map(([n, x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#3c7a22" stroke-width="6" pointer-events="none"/><text x="${x}" y="${y + 52}" text-anchor="middle">${n}</text>`).join('')}
  </svg>`;

const miniMap = (label) => `
  <div class="minimap"><svg viewBox="0 0 600 300" role="img" aria-label="${esc(label)}">
    <rect width="600" height="300" fill="#f4f8f0"/>
    ${[[0, 0, 82, 88], [98, 0, 210, 88], [324, 0, 178, 88], [518, 0, 82, 88], [0, 104, 82, 88], [98, 104, 210, 88], [324, 104, 178, 88], [518, 104, 82, 88], [0, 208, 82, 92], [98, 208, 210, 92], [324, 208, 178, 92], [518, 208, 82, 92]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e6efdf"/>`).join('')}
    <path d="M-10 262 610 34" stroke="#f3dca6" stroke-width="16"/>
    <path d="M152 68 445 44 536 152 412 252 188 226 116 148z" fill="rgba(120,200,90,.42)" stroke="#3c7a22" stroke-width="3"/>
    ${[[258, 128], [412, 108], [206, 174], [348, 168], [296, 194]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#e8872b"/>`).join('')}
  </svg><span>${esc(label)}</span></div>`;

/* ---------- homepage: screens 1-8, 52, 53 ---------- */
route('/', async () => {
  const c = site.company;
  const svcCard = (p) => `<article class="card svc">${photo(p.photo)}<div class="body"><h3>${esc(p.service)}</h3><p>${esc(p.blurb)}</p>
    <div class="meta"><span>${p.from ? 'From AED ' + p.from : esc(p.fromLabel)}</span>${p.warrantyMonths ? `<span class="pill sm">${p.warrantyMonths}-month warranty</span>` : ''}</div>
    ${p.inspection ? `<a class="btn" href="/inspection?job=${p.commercial ? 'amc' : 'termite'}">Request inspection</a>` : `<button class="btn" data-svc="${p.id}"><span class="live"></span>Check availability</button>`}</div></article>`;
  const html = `
  <section class="hero"><div class="wrap grid">
    <div class="media">${photo('Photo: technician treating a kitchen')}</div>
    <div>
      <h1>Pest control in Dubai, Sharjah and Ajman</h1>
      <p class="tagline">Pests gone, or we come back free.</p>
      <p class="intro">Know your price before you book. Same-day visits available.</p>
      <div class="rating">${stars(5)}<span><b>${c.rating}</b> on Google reviews</span></div>
      <div class="cta stack">${checkBtn()}<a class="btn ghost" href="${c.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></div>
      <div class="trust"><div>${icon('shield')}Municipality approved</div><div>${icon('check')}Safe for kids and pets</div><div>${icon('calendar')}6-month warranty</div></div>
    </div>
  </div></section>

  <section class="sec tint" id="why"><div class="wrap">
    <h2>Why homes in the UAE choose Akkad</h2>
    <div class="why">${site.why.map(([ic, t, d]) => `<div class="card"><span class="ic-circle">${icon(ic, 26)}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div>
    <div class="why-cta" style="margin-top:16px"><button class="btn" data-check>Check availability</button></div>
  </div></section>

  <section class="sec" id="services"><div class="wrap">
    <h2>Our pest control services</h2>
    <p class="lead"><span class="mob">Swipe to see all ${site.pests.length} services</span><span class="desk">${site.pests.length} services, each with a clear starting price</span></p>
    ${sliderHtml(site.pests.map(svcCard), { cls: 'four' })}
    <div class="card on scan">${icon('camera', 34)}<div class="grow" style="flex:1"><h3>Not sure what it is?</h3><p>Snap a photo, we'll identify it free.</p></div><a class="btn ghost sm" href="/photos?mode=identify">Scan</a></div>
  </div></section>

  <section class="sec tint" id="how"><div class="wrap">
    <h2>How it works</h2>
    <div class="steps3">${['Check availability in your area', 'See your price and pick a time', 'Technician treats, warranty starts'].map((t, i) => `<div class="card"><span class="num">${i + 1}</span><p>${t}</p></div>`).join('')}</div>
    <div class="how-grid">${photo("Photo: Akkad technician at a customer's door")}
      <div class="how-side"><div class="card dark guarantee"><h3>${icon('shield', 28)}Akkad guarantee</h3><p>If pests return within your warranty, we come back free.</p></div>${checkBtn()}</div></div>
  </div></section>

  <section class="sec" id="coverage"><div class="wrap">
    <h2>We come to you in Dubai, Sharjah and Ajman</h2>
    <div class="cover">
      <div>${uaeMap()}<p class="note center" style="margin:12px 0 10px">Tap your emirate to choose your community</p>
        <div class="chips" style="justify-content:center">${site.emirates.map((e) => `<a class="chip" href="/area?emirate=${e}" style="text-decoration:none;color:inherit">${e}</a>`).join('')}</div></div>
      <div class="side stack">
        <div class="card"><h3 class="ic-row" style="gap:8px;font-size:20px">${icon('shield', 26)}Already an Akkad customer?</h3><p class="sub" style="margin-bottom:12px">Use your warranty with your booking number.</p><button class="btn ghost" data-warranty>Request a warranty visit</button></div>
        <div class="card"><h3 class="ic-row" style="gap:8px;font-size:20px">${icon('doc', 26)}Termite control or commercial AMC</h3><p class="sub" style="margin-bottom:12px">Inspection required before we price it.</p><a class="btn ghost" href="/inspection">Request inspection</a></div>
      </div>
    </div>
  </div></section>

  <section class="sec tint" id="guide"><div class="wrap guide-grid">
    <div><h2 class="sec-h">Pest control in Dubai: what to expect</h2>
      <p class="muted" style="margin-top:10px">A short guide in plain words: common pests in UAE homes, how treatment works, and how to keep them away. <a href="/guide">Read more</a></p>
      <div class="desk" style="margin-top:22px">${photo('Photo: technician explaining the treatment')}</div></div>
    <div><h2 class="sec-h" style="margin-bottom:14px">Common questions</h2>
      <div class="faq">${site.faq.map(([q, a]) => `<details><summary>${esc(q)}${icon('down', 22)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>
  </div></section>

  <section class="sec" id="reviews"><div class="wrap">${googleBlock(site.googleReviews, 'What customers say on Google')}</div></section>`;
  return {
    title: '', html, loc: true, bar: true,
    mount(root) {
      on(root, '[data-svc]', (b) => { S.draft = { ...S.draft, preset: b.dataset.svc }; save(); book(); });
      on(root, '[data-warranty]', () => warrantyEntry());
      on(root, '.uae .em', (p) => go('/area?emirate=' + p.dataset.em));
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
      <div id="results" class="stack"></div><p class="note">Type a community or tower name.</p></div>`,
    mount(root) {
      const out = $('#results', root);
      let n = 0;
      const search = async () => {
        const mine = ++n;
        const { areas } = await api(`/areas?q=${encodeURIComponent($('#q', root).value.trim())}&emirate=${encodeURIComponent(emirate)}`);
        if (mine !== n) return;
        out.innerHTML = areas.length ? areas.map((a, i) => `<button class="card" data-i="${i}"><span class="ic-row">${icon('pin', 22)}<span class="grow" style="font-size:18px;color:var(--ink)">${esc(a.label)}${a.label !== a.name ? `<small class="muted" style="display:block;font-size:14px">${esc(a.name)}</small>` : ''}</span><small class="muted">${esc(a.emirate)}</small></span></button>`).join('')
          : `<div class="card"><h3>We could not find that area</h3><p class="sub">Check the spelling, or message us and we will tell you if we cover it.</p><a class="btn ghost" style="margin-top:12px" href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></div>`;
        out.areas = areas;
      };
      $('#q', root).addEventListener('input', search);
      on(out, '[data-i]', (b) => { const a = out.areas[b.dataset.i]; foundPopup({ slug: a.slug, name: a.name, short: a.short, emirate: a.emirate }); });
      search();
    },
  };
});

/* ---------- screens 16-18: the page now talks about the customer's area ---------- */
route('/pest-control/:slug', async ({ slug }) => {
  const d = await api('/areas/' + slug);
  if (!S.area || S.area.slug !== slug) { S.area = d.area; save(); }
  const a = d.area, st = d.stats, top = d.topPest;
  const pestName = (id) => (site.pests.find((p) => p.id === id) || {}).name || '';
  const jobCard = (r) => `<article class="card rev job" data-pest="${r.pest}">${photo(r.photo)}<div class="body">
    <div class="who"><span class="av g">${esc(r.initials)}</span><div><b>${esc(r.name)} <span class="pill sm">Verified Akkad job</span></b><small>Tower in ${esc(a.short)} · ${esc(r.home)}</small></div></div>
    <p class="muted" style="margin:8px 0 4px">${esc(pestName(r.pest))} · ${esc(r.method)} · ${esc(r.date)}</p>${stars(r.stars)}
    <blockquote>"${esc(r.text)}"</blockquote><p class="muted" style="margin-top:10px">Technician name · arrived in ${r.arrived} min</p></div></article>`;
  const filters = [[top.id, top.name], ['', 'All pests'], ...[...new Set(d.neighborReviews.map((r) => r.pest))].filter((p) => p !== top.id).map((p) => [p, pestName(p)])];
  const html = `
  <section class="area-hero"><div class="wrap">
    <h1>Pest control in ${esc(a.name)}</h1>
    <div class="chips" style="margin-top:14px"><span class="pill line"><b>${st.homes}</b> homes treated here</span><span class="pill line"><span style="color:var(--star)">★</span><b>${st.rating}</b> from neighbors</span><span class="pill line"><span class="live"></span>Team nearby now</span></div>
  </div></section>
  <section class="sec" style="padding-top:8px"><div class="wrap area-grid">
    <div>${miniMap('Recent treatments near you')}
      <p class="note" style="margin-top:10px">Orange dots: homes we treated in ${esc(a.short)} in the last 90 days.</p>
      <div class="desk" style="margin-top:22px">${photo(`Photo of the work: kitchen treatment, ${a.short}`)}</div></div>
    <div class="card on pricecard" id="price"><h3>${esc(top.service.replace(' control', ' treatment'))} in ${esc(a.short)}</h3>
      <p>From AED ${top.from} incl. VAT · ${top.warrantyMonths}-month warranty</p><button class="btn" data-price>Check my price</button>
      <p class="note center" style="margin:10px 0 0">Not ${esc(top.single)}? <a href="/book/services">See every pest and price</a></p></div>
  </div></section>
  <section class="sec tint" id="neighbors"><div class="wrap">
    <h2>What your neighbors say</h2><p class="lead">Swipe through real Akkad jobs in ${esc(a.short)}</p>
    <div class="card score" style="margin-bottom:14px"><b>${st.rating}</b>${stars(5)}<span>${st.homes} ${esc(a.short)} jobs</span></div>
    <div class="chips" id="filters" style="margin-bottom:14px">${filters.map(([id, n], i) => `<button class="chip ${i ? '' : 'on'}" data-f="${id}">${esc(n)}</button>`).join('')}</div>
    ${sliderHtml(d.neighborReviews.map(jobCard))}
  </div></section>
  <section class="sec" id="reviews"><div class="wrap">
    <div class="card on pricecard mob" style="margin-bottom:22px"><h2 class="sec-h" style="font-size:20px">Ready when you are</h2><p>${esc(top.service.replace(' control', ' treatment'))} in ${esc(a.short)} · from AED ${top.from} incl. VAT · ${top.warrantyMonths}-month warranty</p><button class="btn" data-price>Check my price</button></div>
    ${googleBlock(d.googleReviews, `Google reviews from ${esc(a.short)}`)}
  </div></section>`;
  return {
    title: `Pest control in ${a.name}`, html, head: 'area', bar: true, loc: false,
    mount(root) {
      on(root, '[data-price]', () => teamPopup());
      on(root, '[data-f]', (b) => {
        $$('#filters .chip', root).forEach((c) => c.classList.toggle('on', c === b));
        $$('.rev.job', root).forEach((c) => { c.hidden = !!b.dataset.f && c.dataset.pest !== b.dataset.f; });
        const tr = $('#neighbors .track', root); tr.scrollLeft = 0; tr.dispatchEvent(new Event('scroll'));
      });
      $('[data-f]', root).click();
      // Screen 19 appears by itself once the reviews have been seen.
      if (!teamSeen() && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => {
          if (es.some((e) => e.isIntersecting) && !$('#layer').classList.contains('open')) { io.disconnect(); setTimeout(() => { if (location.pathname === areaUrl(a)) teamPopup(); }, 1400); }
        }, { threshold: 0.6 });
        io.observe($('#reviews .slider', root));
        onLeave(() => io.disconnect());
      }
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
    <p style="font-size:18px">They call from ${site.company.phone} to agree an inspection time that suits you.</p>
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
    <p style="font-size:18px">${q.get('mode') === 'identify' ? 'You will hear from us on WhatsApp with what it is and what to do about it.' : 'You will get the price on WhatsApp. No visit is needed unless the photos leave questions.'}</p>
    ${nextSteps([['Team reviews your photos', 'An engineer checks the problem and the area.'], ['We call or WhatsApp', 'Only if we need more details.'], ['Price sent on WhatsApp', 'With the treatment plan and warranty.'], ['Inspection if needed', 'Some sites still need a visit before we start.']])}</div>`,
}));

/* ---------- guide ---------- */
route('/guide', async () => ({
  title: 'Pest control in Dubai: what to expect', bar: true,
  html: `<div class="flow"><h1 class="big">Pest control in Dubai: what to expect</h1>
    <p class="muted">A short guide in plain words.</p>
    <h2>Common pests in UAE homes</h2><p>Cockroaches are the most common call-out, especially in kitchens and drains during the warmer months. Bed bugs travel in luggage and furniture. Ants, rodents, mosquitoes and flies follow food, water and gaps in doors and pipes. Termites attack wood and need a site survey.</p>
    <div class="pests">${site.pests.filter((p) => !p.commercial).map((p) => `<button data-p="${p.id}">${icon('bug', 28)}<b>${esc(p.name)}</b><span>${esc(p.signs)}</span><i>${p.from ? 'From AED ' + p.from : esc(p.fromLabel)}</i></button>`).join('')}</div>
    <h2>How treatment works</h2><p>The technician inspects first to find the source, then treats with Dubai Municipality-approved products: gel in hidden places, spray where it is needed. Before leaving, he explains what was done and what to expect over the next days.</p>
    <h2>How to keep them away</h2><p>Keep food sealed, empty bins daily, fix dripping taps, and close gaps around pipes and doors. If the same pest returns during your warranty, we come back free.</p>
    <button class="btn" data-check><span class="live"></span>Check availability</button></div>`,
  mount(root) { on(root, '[data-p]', (b) => { const p = site.pests.find((x) => x.id === b.dataset.p); if (p.inspection) go('/inspection'); else { S.draft = { ...S.draft, preset: p.id }; save(); book(); } }); },
}));
