// Content pages: one page per service, services overview, about, contact, commercial and legal pages.
// Service pages carry the same "Your booking" basket as the homepage, so every page can book.
import { site, api, route, go, esc, icon, aed, photo, imgFor, on, $, $$, busy, showErr } from './core.js';
import { pkgCard, surveyCard, pestIcon, bookingAside, bookingBar, mountBooking } from './store.js';

const svcOf = (p) => site.services && site.services[p.id];
const svcUrl = (p) => (p.id === 'amc' ? '/commercial' : `/services/${svcOf(p).slug}`);
const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([t, h], i) => (h && i < items.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(icon('right', 13))}</nav>`;
const ticks = (list, ic = 'check') => `<ul class="ticks">${list.map((t) => `<li>${icon(ic, 17)}<span>${esc(t)}</span></li>`).join('')}</ul>`;
const faqBox = (faq) => `<div class="card st-faq">${faq.map(([q, a], i) => `<details ${i ? '' : 'open'}><summary>${esc(q)}${icon('down', 18)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const fromLabel = (p) => (p.from ? `From ${aed(p.from)}` : p.fromLabel);
const contactBtns = () => `<a class="btn ghost" href="${site.company.whatsapp}" target="_blank" rel="noopener">${icon('chat', 18)}WhatsApp us</a>`;
const SURVEY_STEPS = [['Free site inspection', 'A specialist visits and checks the whole property.'], ['Clear plan and fixed price', 'You get the treatment plan and the price before any work starts.'], ['Treatment and protection', 'Targeted treatment, plus barrier protection where needed.'], ['Follow-up', 'We check the result and keep your records up to date.']];

/* ---------- /services/<service>: everything about one pest, with its packages ---------- */
route('/services/:slug', async ({ slug }) => {
  const p = site.pests.find((x) => svcOf(x) && svcOf(x).slug === slug);
  if (!p) return { title: 'Service not found', html: `<div class="flow"><h1>We could not find that service</h1><p class="muted">The link may be old.</p><a class="btn" href="/services">See all services</a></div>` };
  if (p.id === 'amc') { go('/commercial', { replace: true }); return null; }
  const t = svcOf(p);
  const steps = p.steps && p.steps.length ? p.steps : SURVEY_STEPS;
  const others = site.pests.filter((x) => x.id !== p.id && svcOf(x));
  const name = p.id === 'amc' ? 'pests in your business' : p.single;
  const html = `
  <div class="wrap store info">
    <div class="st-main">
      ${crumbs([['Home', '/'], ['Services', '/services'], [p.service]])}
      <section class="sv-hero card">
        <div class="sv-hero-text">
          <span class="sv-ico" style="background-image:url('${esc(pestIcon(p.id))}')"></span>
          <h1>${esc(t.title)}</h1>
          <p class="sv-lead">${esc(t.lead)}</p>
          <div class="st-rating"><span class="rate-chip">★ ${site.company.rating}</span><span>${esc(fromLabel(p))} incl. VAT</span>${p.warrantyMonths ? `<span class="st-dot"></span><span>${p.warrantyMonths}-month warranty</span>` : ''}</div>
          <div class="sv-cta"><button class="btn" data-go="packages">${p.inspection ? 'Request a free survey' : 'See prices and book'}${icon('arrow', 18)}</button>${contactBtns()}</div>
        </div>
        <div class="sv-hero-img">${photo(p.service, imgFor(p.photo))}</div>
      </section>

      <section class="st-block"><h2>Signs of ${esc(name)}</h2>${ticks(t.signs, 'search')}</section>
      <section class="st-block"><h2>Why ${p.id === 'amc' ? 'businesses need regular pest control' : `${esc(p.single)} appear in UAE homes`}</h2>${ticks(t.causes, 'info')}</section>
      <section class="st-block"><h2>How we treat ${esc(name)}</h2>
        <ol class="card st-how">${steps.map(([h, d], i) => `<li><span class="n">${i + 1}</span><div><b>${esc(h)}</b><small>${esc(d)}</small></div></li>`).join('')}</ol>
      </section>

      <section class="st-block st-sec" id="packages" data-sec="${p.id}"><h2>${p.inspection ? 'Free survey' : 'Prices and packages'}</h2>
        <p class="st-intro">${p.inspection ? 'Priced after a free inspection, so you only pay for what your property needs.' : 'Prices include VAT. Choose your home size when you add a package.'}</p>
        ${p.inspection ? surveyCard(p) : p.packages.map((pk) => pkgCard(p, pk)).join('')}
      </section>

      ${p.prep ? `<section class="st-block"><h2>Before we arrive</h2><p class="card sv-note">${icon('info', 18)}<span>${esc(p.prep)}</span></p></section>` : ''}
      <section class="st-block"><h2>How to keep them away</h2>${ticks(t.prevention)}</section>
      <section class="st-block"><h2>Questions about ${esc(p.id === 'amc' ? 'commercial pest control' : p.single)}</h2>${faqBox(t.faq)}</section>

      <section class="st-block"><h2>Other services</h2>
        <div class="sv-others">${others.map((x) => `<a href="${svcUrl(x)}"><span style="background-image:url('${esc(pestIcon(x.id))}')"></span><b>${esc(x.service)}</b><small>${esc(fromLabel(x))}</small></a>`).join('')}</div>
      </section>
    </div>
    ${bookingAside()}
  </div>
  ${bookingBar()}`;
  return {
    title: p.service, html, bar: false,
    mount(root) {
      mountBooking(root);
      on(root, '[data-go]', (b) => { const el = $('#' + b.dataset.go, root); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); });
    },
  };
});

/* ---------- /services: overview of every service ---------- */
route('/services', async () => ({
  title: 'Our services', bar: true,
  html: `<div class="wrap info-page">
    ${crumbs([['Home', '/'], ['Services']])}
    <h1 class="info-h1">Pest control services</h1>
    <p class="info-lead">Clear prices, municipality-approved products and a warranty on every treatment. Choose a service to see signs, treatment and packages.</p>
    <div class="svc-grid">${site.pests.filter(svcOf).map((p) => `<a class="card svc-tile" href="${svcUrl(p)}">
      <span class="sv-ico" style="background-image:url('${esc(pestIcon(p.id))}')"></span>
      <div><h2>${esc(p.service)}</h2><p>${esc(p.blurb)}</p></div>
      <div class="svc-tile-foot"><b>${esc(fromLabel(p))}</b><span>Learn more${icon('arrow', 15)}</span></div></a>`).join('')}</div>
    <div class="info-cta card"><div><h2>Not sure what you have?</h2><p class="muted">Send us a photo and we'll identify it for free.</p></div><a class="btn" href="/photos?mode=identify">${icon('camera', 18)}Send a photo</a></div>
  </div>`,
}));

/* ---------- /about ---------- */
route('/about', async () => {
  const c = site.company;
  return {
    title: 'About us', bar: true,
    html: `<div class="wrap info-page">
      ${crumbs([['Home', '/'], ['About us']])}
      <h1 class="info-h1">About Akkad Pest Control</h1>
      <p class="info-lead">${esc(c.name)} keeps homes and businesses in Dubai, Sharjah and Ajman free of pests, with clear prices and a warranty on every treatment.</p>
      <div class="about-photo">${photo('The Akkad Pest Control team and vans', '/img/akkad-team.jpg')}</div>

      <section class="info-sec"><h2>What we stand for</h2>
        <div class="value-grid">${[
          ['shield', 'Approved and licensed', 'We use Dubai Municipality-approved products and follow municipality guidelines on every job.'],
          ['check', 'Safe for families', 'Treatments are chosen for homes with children and pets, and the technician explains what was used and where.'],
          ['card', 'Clear prices', 'You see the full price, including VAT, before you book. Nothing is added without your approval.'],
          ['calendar', 'Pests gone, or we come back', 'Every treatment has a warranty. If pests return during it, the call-out is free.'],
        ].map(([ic, h, d]) => `<div class="card value"><span class="ic-circle">${icon(ic, 22)}</span><h3>${h}</h3><p>${d}</p></div>`).join('')}</div>
      </section>

      <section class="info-sec"><h2>How we work</h2>
        <ol class="card st-how">${[['Book online or on WhatsApp', 'See your price first, then choose express or a time that suits you.'], ['A trained technician arrives', 'Uniformed, on time, and you can follow the van live.'], ['Inspect, treat and explain', 'We find the source, treat it and tell you what to expect next.'], ['Report and warranty', 'Your service report and receipt arrive on WhatsApp, and your warranty starts.']].map(([h, d], i) => `<li><span class="n">${i + 1}</span><div><b>${h}</b><small>${d}</small></div></li>`).join('')}</ol>
      </section>

      <section class="info-sec"><h2>Where we work</h2>
        <p class="muted">Same-day teams across ${site.emirates.join(', ').replace(/, ([^,]*)$/, ' and $1')}. Our office is at ${esc(c.address)}.</p>
        <div class="em-chips" style="margin-top:12px">${site.emirates.map((e) => `<a class="em-chip" href="/area">${e}${icon('right', 14)}</a>`).join('')}</div>
      </section>

      <div class="info-cta card"><div><h2>Ready when you are</h2><p class="muted">Book in a minute and see your price before you pay.</p></div><div class="row-btns"><a class="btn" href="/#st-list">Book now${icon('arrow', 18)}</a>${contactBtns()}</div></div>
    </div>`,
  };
});

/* ---------- /contact: details and a message form ---------- */
route('/contact', async () => {
  const c = site.company;
  const topics = ['New booking', 'My booking', 'Commercial', 'Other'];
  return {
    title: 'Contact us', bar: true,
    html: `<div class="wrap info-page">
      ${crumbs([['Home', '/'], ['Contact']])}
      <h1 class="info-h1">Contact us</h1>
      <p class="info-lead">The fastest way to reach us is WhatsApp. You can also call, or send a message and we'll get back to you.</p>
      <div class="contact-grid">
        <div class="contact-ways">
          <a class="card way" href="${c.whatsapp}" target="_blank" rel="noopener"><span class="ic-circle">${icon('chat', 22)}</span><div><b>WhatsApp</b><small>Message us on ${esc(c.whatsappNumber)}</small></div>${icon('right', 16)}</a>
          <a class="card way" href="${c.phoneHref}"><span class="ic-circle">${icon('phone', 22)}</span><div><b>Call us</b><small>${esc(c.phone)}</small></div>${icon('right', 16)}</a>
          ${c.email ? `<a class="card way" href="mailto:${esc(c.email)}"><span class="ic-circle">${icon('doc', 22)}</span><div><b>Email</b><small>${esc(c.email)}</small></div>${icon('right', 16)}</a>` : ''}
          <a class="card way" href="${c.mapsUrl || '/#contact'}" target="_blank" rel="noopener"><span class="ic-circle">${icon('pin', 22)}</span><div><b>Our office</b><small>${esc(c.address)}</small></div>${icon('right', 16)}</a>
          ${c.hours ? `<div class="card way"><span class="ic-circle">${icon('calendar', 22)}</span><div><b>Opening hours</b><small>${esc(c.hours)}</small></div></div>` : ''}
        </div>
        <form class="card contact-form" novalidate>
          <h2>Send us a message</h2>
          <div class="chips" id="topic" role="radiogroup" aria-label="Topic">${topics.map((t, i) => `<button type="button" class="chip ${i ? '' : 'on'}" data-topic="${t}" aria-pressed="${!i}">${t}</button>`).join('')}</div>
          <label class="field">${icon('check')}<span class="sr">Your name</span><input name="name" placeholder="Your name" autocomplete="name"></label>
          <label class="field">${icon('phone')}<span class="sr">Mobile number</span><input name="mobile" type="tel" inputmode="tel" placeholder="Mobile number (WhatsApp)" autocomplete="tel"></label>
          <label class="field" style="align-items:flex-start"><span class="sr">Message</span><textarea name="message" rows="4" placeholder="How can we help?"></textarea></label>
          <p class="err"></p>
          <button class="btn">Send message${icon('arrow', 18)}</button>
          <p class="note center">We reply on WhatsApp, usually within the hour during working times.</p>
        </form>
      </div>
    </div>`,
    mount(root) {
      on(root, '[data-topic]', (b) => $$('[data-topic]', root).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }));
      $('form', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        busy($('form .btn', root), async () => {
          try {
            const r = await api('/messages', { ...f, topic: $('[data-topic].on', root).dataset.topic });
            e.target.innerHTML = `<div class="sent"><span class="bigcheck">${icon('tick', 34)}</span><h2>Thanks, ${esc(f.name.split(' ')[0])}</h2><p class="muted">We have your message (reference ${esc(r.id)}). We'll reply on WhatsApp to ${esc(f.mobile)}.</p><a class="btn ghost" href="/">Back to the homepage</a></div>`;
          } catch (err) { showErr(root, err); }
        });
      });
    },
  };
});

/* ---------- /commercial ---------- */
route('/commercial', async () => {
  const p = site.pests.find((x) => x.id === 'amc');
  const t = svcOf(p);
  return {
    title: 'Commercial pest control', bar: true,
    html: `<div class="wrap info-page">
      ${crumbs([['Home', '/'], ['Commercial']])}
      <section class="sv-hero card">
        <div class="sv-hero-text"><span class="of-kicker green">FOR BUSINESSES</span>
          <h1>${esc(t.title)}</h1><p class="sv-lead">${esc(t.lead)}</p>
          <div class="sv-cta"><a class="btn" href="/inspection?job=amc">Request a free inspection${icon('arrow', 18)}</a>${contactBtns()}</div></div>
        <div class="sv-hero-img">${photo('Commercial kitchen inspection', '/img/commercial-kitchen-inspection.webp')}</div>
      </section>
      <section class="info-sec"><h2>Who we work with</h2>
        <div class="sector-grid">${[['Restaurants and cafés', 'Kitchens, stores and bin areas'], ['Offices', 'Pantries, washrooms and service areas'], ['Residential buildings', 'Common areas, ducts and bin rooms'], ['Warehouses', 'Loading bays and storage'], ['Hotels', 'Rooms, kitchens and back of house'], ['Schools and clinics', 'Safe, scheduled treatments']].map(([h, d]) => `<div class="card sector"><b>${h}</b><small>${d}</small></div>`).join('')}</div>
      </section>
      <section class="info-sec"><h2>What's included</h2>${ticks(['Free site inspection and a written plan', 'Scheduled visits through the year', 'A service report after every visit, ready for inspections', 'Call-outs between scheduled visits', 'One contract for all your locations'])}</section>
      <section class="info-sec"><h2>How it works</h2>
        <ol class="card st-how">${SURVEY_STEPS.map(([h, d], i) => `<li><span class="n">${i + 1}</span><div><b>${h}</b><small>${d}</small></div></li>`).join('')}</ol></section>
      <section class="info-sec"><h2>Questions from businesses</h2>${faqBox(t.faq)}</section>
      <div class="info-cta card"><div><h2>Get a plan for your business</h2><p class="muted">The inspection is free and there's no obligation.</p></div><a class="btn" href="/inspection?job=amc">Request a free inspection${icon('arrow', 18)}</a></div>
    </div>`,
  };
});

/* ---------- legal pages (drafts based on how the site works; review before launch) ---------- */
const UPDATED = '20 November 2026';
const legal = (title, intro, sections) => async () => ({
  title, bar: true,
  html: `<div class="wrap info-page legal">
    ${crumbs([['Home', '/'], [title]])}
    <h1 class="info-h1">${title}</h1><p class="info-lead">${intro}</p><p class="note">Last updated ${UPDATED}</p>
    ${sections.map(([h, body]) => `<section class="info-sec"><h2>${h}</h2>${body.map((x) => (Array.isArray(x) ? `<ul>${x.map((li) => `<li>${li}</li>`).join('')}</ul>` : `<p>${x}</p>`)).join('')}</section>`).join('')}
    <section class="info-sec"><h2>Contact</h2><p>Questions about this page? Contact ${esc(site.company.name)}, ${esc(site.company.address)}, on <a href="${site.company.phoneHref}">${esc(site.company.phone)}</a> or <a href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>.</p></section>
  </div>`,
});

route('/privacy', legal('Privacy policy', 'How we collect, use and protect your personal information when you use our website and services.', [
  ['What we collect', ['When you book or contact us we collect:', ['Your name and mobile number', 'Your address, building and apartment number', 'Your area, and your location if you allow the browser to share it', 'Booking details: service, home size, date and time, and payment method', 'Photos and descriptions you send us', 'Messages you send through the website or WhatsApp']]],
  ['How we use it', [['To arrange, carry out and follow up on your treatment', 'To send booking confirmations, reminders, codes and service reports on WhatsApp', 'To handle warranty visits, rescheduling and cancellations', 'To answer your questions and improve our service']]],
  ['Who we share it with', ['We only share what is needed to provide the service:', ['Our technicians, to reach you and do the job', 'Payment providers (Network International for cards, Tabby for instalments), who process payments securely; we do not store your card details', 'Our WhatsApp messaging provider, to send you messages', 'Authorities, when the law requires it']], 'We do not sell your personal information.'],
  ['How long we keep it', ['We keep booking records for as long as needed for your warranty, our legal and tax obligations and to resolve disputes. You can ask us to delete information we no longer need.']],
  ['Your choices', [['Ask what information we hold about you', 'Ask us to correct or delete it', 'Ask us to stop sending you messages that are not about an active booking']]],
  ['Cookies and storage', ['The website stores small amounts of information in your browser, such as your chosen area and the booking you are building, so the site remembers them. It does not use advertising cookies.']],
]));

route('/terms', legal('Terms of service', 'The terms that apply when you book a pest control service with us.', [
  ['Bookings', ['A booking is confirmed when you receive a confirmation on the website or WhatsApp. Please make sure your contact and address details are correct.']],
  ['Prices', ['Prices shown include VAT. The price depends on the service and your home size. Express visits have an extra fee, shown before you book. Termite and commercial work is priced after a free inspection. We never add charges without your approval.']],
  ['Arrival times', ['Express arrival times are estimates and can change with traffic and earlier jobs. You can follow your technician live. For scheduled visits, the technician arrives within the time slot you chose.']],
  ['Your part', [['Give the technician safe access to the areas to be treated', 'Follow the preparation advice sent before your visit', 'Keep children and pets away from treated areas for the time the technician advises', 'Tell us about allergies, health conditions or pets before treatment']]],
  ['Warranty', ['Your treatment has the warranty shown when you book: 6 months with unlimited call-outs on general, cockroach, ant and bed bug treatments. If the same pest returns during the warranty, we come back free. One-time visits and services marked "no warranty" are not covered. See <a href="/warranty-cover">warranty and call-outs</a>. The warranty may not apply if the preparation and aftercare advice was not followed, or if the problem comes from a source outside the treated property.']],
  ['Payment', ['You can pay by card or with Tabby in instalments, if eligible. Payments are processed securely by our payment providers.']],
  ['Rescheduling and cancelling', ['See our <a href="/cancellation-policy">cancellation policy</a>.']],
  ['Refunds', ['We refund if we did not carry out the treatment, or if you paid twice by mistake. See our <a href="/refund-policy">refund policy</a>.']],
  ['Liability', ['We carry out every treatment with care and approved products. We are not responsible for loss or damage caused by information that was not shared with us, or by not following the technician\'s advice, as far as the law allows.']],
  ['Law', ['These terms are governed by the laws of the United Arab Emirates and the Emirate of Dubai.']],
]));

route('/cancellation-policy', legal('Cancellation policy', 'How to reschedule or cancel a booking, and what happens to your payment.', [
  ['Rescheduling', ['You can move your visit to another open day or time from your booking page, free of charge, until the technician sets off.']],
  ['Cancelling', ['You can cancel from your booking page. The amount you paid stays as Akkad credit for 90 days, which you can use on any service. Credit is applied automatically to your next booking.']],
  ['Express visits', ['Once the technician has set off for an express visit, the express fee cannot be refunded. You can still move the treatment to later today or another day.']],
  ['Refunds', ['We refund in two cases: we did not carry out the treatment, or you paid twice by mistake. See our <a href="/refund-policy">refund policy</a>.']],
  ['Warranty visits', ['Warranty visits are free. If you can no longer be home, please reschedule or cancel from your booking page so another customer can have the slot.']],
  ['If we need to change your visit', ['If we need to move your visit, we will tell you on WhatsApp as early as possible and offer you the next available times.']],
]));

/* ---------- more pages: warranty cover, refunds, how it works, safety, questions (drafts; review before launch) ---------- */
route('/warranty-cover', legal('Warranty and call-outs', '6-month warranty with unlimited call-outs. If the pests come back, so do we, free.', [
  ['What you get', [['6 months of cover from the day of your treatment', 'Unlimited call-outs: if the same pest returns, we treat again as many times as needed', 'No charge for the treatment or materials on a warranty visit']]],
  ['Which services are covered', [['General pest control', 'Cockroach control', 'Ant control', 'Bed bug treatment, and bed bugs + general pest control', 'Fly control: 6-month warranty with 2 follow-up visits']]],
  ['Not covered', [['The one-time general pest control visit (AED 99 apartment, AED 210 villa): one visit, no warranty', 'Rodents, mosquitoes, and wasp or bee nest removal: 2 visits, no warranty', 'A different pest from the one we treated', 'Problems that come from outside the treated property']]],
  ['How to ask for a warranty visit', ['Tap <a href="/warranty">Warranty</a> at the top of the site and enter your booking number, or the mobile number you booked with. Choose a time and we come back.', 'A scheduled warranty visit is free. If you want us there within about 30 minutes, only the express call-out fee applies.']],
  ['Keeping your warranty valid', ['Please follow the preparation and aftercare advice your technician gives you. It is what makes the treatment last.']],
]));

route('/refund-policy', legal('Refund policy', 'When we refund a payment, and how to ask for it.', [
  ['When we refund', ['We refund your payment in two cases:', ['We did not carry out the treatment you paid for', 'You paid twice for the same booking by mistake']]],
  ['When we do not refund', [['After the treatment has been carried out', 'For a one-time visit (AED 99 apartment, AED 210 villa): it is a single service with no warranty', 'If pests return during your warranty: we come back and treat again free instead, with unlimited call-outs for 6 months']]],
  ['If you cancel before the visit', ['See our <a href="/cancellation-policy">cancellation policy</a>. You can also move the visit to another day free of charge.']],
  ['How to ask for a refund', ['Call or WhatsApp us with your booking number. If you paid twice, please send both payment receipts. We refund to the same card or payment method you used.']],
]));

route('/how-it-works', legal('How it works', 'From booking to a pest-free home, in four steps.', [
  ['1. Choose your service', ['Pick the pest and your home size. You see the full price, VAT included, before you book.']],
  ['2. Pick a time', ['Express: a technician near you arrives in about 30 minutes. Or choose any open slot that suits you.']],
  ['3. We treat your home', ['The technician inspects, treats with municipality-approved products, then explains what was done and what to do next. You can follow his arrival live.']],
  ['4. You are covered', ['Warranty services come with 6 months of cover and unlimited call-outs. If the pest returns, ask for a free visit from the <a href="/warranty">Warranty</a> button.']],
  ['Paying', ['Pay by card, or split it into 4 payments with Tabby if eligible.']],
]));

route('/safety', legal('Safety for children and pets', 'How we keep your family and pets safe during and after a treatment.', [
  ['Approved products', ['We use Dubai Municipality-approved products, applied by trained technicians. The technician tells you what was applied and where.']],
  ['Before the visit', [['Tell us about babies, pregnancy, allergies, asthma or pets when you book', 'Keep pets in one room, and cover or move fish tanks and pet bowls', 'Put away food, dishes and toys in the areas to be treated']]],
  ['After the visit', [['Follow the waiting time the technician gives you before using treated rooms', 'Keep children and pets away from treated spots until they are dry', 'Do not mop or wipe the treated edges for the time he advises']]],
  ['Questions', ['Not sure about something in your home? Ask in the chat or call us before you book.']],
]));

route('/faq', async () => ({
  title: 'Questions and answers', bar: true,
  html: `<div class="wrap info-page legal">
    ${crumbs([['Home', '/'], ['Questions and answers']])}
    <h1 class="info-h1">Questions and answers</h1><p class="info-lead">Quick answers about prices, warranty, refunds and safety.</p>
    ${faqBox([...site.faq,
      ['What is the AED 99 one-time visit?', 'A single general pest control visit at a lower price. It has no warranty and no call-outs. For 6 months of cover, choose general pest control.'],
      ['Can I move or cancel my booking?', 'Yes. You can move it free of charge from your booking page until the technician sets off. See the cancellation policy for cancelling.'],
      ['Do you treat offices, restaurants and buildings?', 'Yes. Commercial work and termite control are priced after a free inspection. Use "Termite or commercial inspection" in the menu.'],
    ])}
    <p class="note" style="margin-top:16px">More: <a href="/warranty-cover">Warranty and call-outs</a> · <a href="/refund-policy">Refund policy</a> · <a href="/safety">Safety</a> · <a href="/how-it-works">How it works</a></p>
  </div>`,
}));
