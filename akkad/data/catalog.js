// Akkad Pest Control: services, packages, prices, areas and review content.
// Everything customer-facing that Akkad will want to edit lives in this file.
//
// NOTE: prices for cockroach control and the "from" prices for every pest come
// from the approved flow (v7). Size-by-size prices for the other pests, the
// reviews and the per-area numbers outside Tecom are SAMPLE values, marked
// `sample: true`, to be replaced with Akkad's real figures.

const COMPANY = {
  name: 'Akkad Pest Control Services',
  brand: 'AKKAD',
  phone: '+971 50 400 1344',
  phoneHref: 'tel:+971504001344',
  whatsapp: 'https://wa.me/971504001344',
  address: 'Sheikha Noora Tower, Office 403, Barsha Heights (Tecom), Dubai',
  domain: 'pestcontrol.ae',
  googleReviewsUrl: 'https://www.google.com/search?q=Akkad+Pest+Control+Services+Dubai+reviews',
  rating: 4.8,
};

const FEES = { expressNew: 18, expressWarranty: 39, etaMin: 28, aboutMin: 30 };

const APT = ['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4 bedrooms'];
const VILLA = ['2 bedrooms', '3 bedrooms', '4 bedrooms', '5 bedrooms', '6+ bedrooms'];
const sizes = (labels, prices) => labels.map((label, i) => ({ id: 's' + i, label, price: prices[i] }));
const shortSize = (homeType, label) => {
  if (homeType === 'villa') return label.replace(' bedrooms', '-bed') + ' villa';
  if (label === 'Studio') return 'studio';
  return label.replace(/ bedrooms?/, '-bed') + ' apt';
};

// A pest has packages. A package is either fixed-price or sized (apartment / villa).
const PESTS = [
  {
    id: 'cockroach', name: 'Cockroaches', single: 'cockroaches', service: 'Cockroach control', short: 'Cockroach',
    signs: 'Seen at night, in kitchen or drains', from: 99, warrantyMonths: 6,
    blurb: 'Gel and spray for kitchens, bathrooms and drains. Most homes are clear within days.',
    intro: 'Gel and spray that reaches hidden nests in kitchens and bathrooms.',
    photo: 'Photo: gel treatment in a kitchen',
    prep: 'Clear kitchen counters and keep pets in one room.',
    steps: [
      ['Inspect', 'Checks kitchen, bathrooms and drains to find the source.'],
      ['Treat', 'Applies gel and spray with municipality-approved products.'],
      ['Explain and hand over', 'Shows what was done, gives safety advice, starts your warranty.'],
    ],
    packages: [
      { id: 'kitchen', title: 'Cockroach control: kitchen only', badge: 'BESTSELLER', duration: '45 mins', price: 99,
        label: 'Cockroach control · kitchen only', photo: 'Photo: gel in kitchen cabinet',
        points: ['Gel in cabinets, hinges, under sink and behind appliances', 'Food-safe, no need to leave home'] },
      { id: 'apartment', title: 'Cockroach control: apartment', duration: '60–90 mins', sized: 'apartment',
        photo: 'Photo: apartment treatment',
        points: ['Whole apartment, kitchen and bathrooms', 'Gel and spray, drains treated'] },
      { id: 'villa', title: 'Cockroach control: villa', duration: '90–120 mins', sized: 'villa',
        photo: 'Photo: villa treatment',
        points: ['Whole villa, kitchens, bathrooms and outdoor drains', 'Garden perimeter spray'] },
    ],
    sizes: { apartment: sizes(APT, [149, 179, 219, 259, 299]), villa: sizes(VILLA, [349, 399, 459, 519, 579]) },
  },
  {
    id: 'bedbugs', name: 'Bed bugs', single: 'bed bugs', service: 'Bed bug treatment', short: 'Bed bug',
    signs: 'Bites at night, spots on sheets', from: 299, warrantyMonths: 3, visits: '2 visits',
    blurb: 'Two visits, 14 days apart, so newly hatched bugs are treated too.',
    intro: 'Two visits, 14 days apart, so newly hatched bugs are treated too.',
    photo: 'Photo: mattress inspection',
    prep: 'Strip the beds and wash bedding on a hot cycle before we arrive.',
    steps: [
      ['Inspect', 'Checks mattresses, bed frames and furniture seams.'],
      ['Treat', 'Sprays and steams with municipality-approved products.'],
      ['Explain and hand over', 'Books the second visit after 14 days and starts your warranty.'],
    ],
    packages: [
      { id: 'room', title: 'Bed bug treatment: one room', badge: 'MOST BOOKED', duration: '2 visits', price: 299,
        label: 'Bed bug treatment · one room', photo: 'Photo: mattress inspection',
        points: ['Mattress, bed frame and furniture', 'Second visit after 14 days'] },
      { id: 'apartment', title: 'Bed bug treatment: apartment', duration: '2 visits', sized: 'apartment',
        photo: 'Photo: bedroom treatment',
        points: ['All bedrooms and living area', 'Second visit after 14 days'] },
      { id: 'villa', title: 'Bed bug treatment: villa', duration: '2 visits', sized: 'villa',
        photo: 'Photo: villa bedroom treatment',
        points: ['All bedrooms, majlis and living areas', 'Second visit after 14 days'] },
    ],
    sample: true,
    sizes: { apartment: sizes(APT, [449, 499, 579, 659, 739]), villa: sizes(VILLA, [799, 899, 999, 1099, 1199]) },
  },
  genericPest('ants', 'Ants', 'ants', 'Ant control', 'Ant', 'Trails in kitchen or balcony', 210,
    'Gel baits and barrier spray that reach the nest, not just the trail.', 'Photo: ant bait placement',
    [210, 230, 260, 290, 320], [370, 420, 470, 520, 570]),
  genericPest('rodents', 'Rodents', 'rodents', 'Rodent control', 'Rodent', 'Droppings, gnawing, noises', 350,
    'Bait stations and traps, with entry points found and sealed.', 'Photo: bait station placement',
    [350, 380, 420, 460, 500], [550, 620, 690, 760, 830]),
  {
    id: 'termites', name: 'Termites', single: 'termites', service: 'Termite control', short: 'Termite',
    signs: 'Mud tubes, hollow wood', from: null, fromLabel: 'Free survey', inspection: true,
    blurb: 'Priced after a free site survey. Our operations team calls you to arrange it.',
    photo: 'Photo: termite inspection',
  },
  genericPest('mosquitoes', 'Mosquitoes', 'mosquitoes', 'Mosquito control', 'Mosquito', 'Bites, standing water nearby', 250,
    'Fogging and larvicide for gardens, balconies and standing water.', 'Photo: garden fogging',
    [250, 270, 300, 330, 360], [420, 470, 520, 570, 620]),
  genericPest('flies', 'Flies', 'flies', 'Fly control', 'Fly', 'Kitchens, bins, restaurants', 210,
    'Baits, traps and residual spray around kitchens and bin areas.', 'Photo: fly treatment near bins',
    [210, 230, 260, 290, 320], [370, 420, 470, 520, 570]),
  {
    id: 'amc', name: 'Commercial AMC', single: 'commercial pest control', service: 'Commercial AMC', short: 'Commercial',
    signs: 'Restaurants, offices, buildings, warehouses', from: null, fromLabel: 'Inspection first', inspection: true, commercial: true,
    blurb: 'Annual contracts for restaurants, offices, buildings and warehouses. Priced after an inspection.',
    photo: 'Photo: commercial kitchen inspection',
  },
];

function genericPest(id, name, single, service, short, signs, from, intro, photo, apt, villa) {
  return {
    id, name, single, service, short, signs, from, warrantyMonths: 3, sample: true,
    blurb: intro, intro, photo,
    prep: 'Keep pets in one room and clear the areas where you have seen ' + single + '.',
    steps: [
      ['Inspect', 'Finds where the ' + single + ' are coming from.'],
      ['Treat', 'Treats the source with municipality-approved products.'],
      ['Explain and hand over', 'Shows what was done, gives safety advice, starts your warranty.'],
    ],
    packages: [
      { id: 'apartment', title: service + ': apartment', badge: 'MOST BOOKED', duration: '45–60 mins', sized: 'apartment',
        photo: 'Photo: apartment treatment', points: ['Whole apartment, inside and balcony', 'Safe for children and pets'] },
      { id: 'villa', title: service + ': villa', duration: '60–90 mins', sized: 'villa',
        photo: 'Photo: villa treatment', points: ['Whole villa and garden perimeter', 'Safe for children and pets'] },
    ],
    sizes: { apartment: sizes(APT, apt), villa: sizes(VILLA, villa) },
  };
}

// Communities. `aliases` are towers and alternative names that map to the community.
const AREAS = [
  ['barsha-heights-tecom', 'Barsha Heights (Tecom)', 'Tecom', 'Dubai', 25.0969, 55.1746, ['Tecom Two Towers', 'Al Thanyah First', 'Sheikha Noora Tower', 'The Greens']],
  ['dubai-marina', 'Dubai Marina', 'Dubai Marina', 'Dubai', 25.0805, 55.1403, ['Marina Walk', 'JBR', 'Jumeirah Beach Residence']],
  ['jlt', 'Jumeirah Lake Towers (JLT)', 'JLT', 'Dubai', 25.0693, 55.1417, ['Cluster towers', 'Almas Tower']],
  ['downtown-dubai', 'Downtown Dubai', 'Downtown', 'Dubai', 25.1972, 55.2744, ['Burj Khalifa district', 'Old Town']],
  ['business-bay', 'Business Bay', 'Business Bay', 'Dubai', 25.185, 55.265, ['Executive Towers', 'Bay Square']],
  ['jvc', 'Jumeirah Village Circle (JVC)', 'JVC', 'Dubai', 25.055, 55.209, ['JVT', 'Jumeirah Village Triangle']],
  ['al-barsha', 'Al Barsha', 'Al Barsha', 'Dubai', 25.1107, 55.2, ['Al Barsha 1', 'Al Barsha South', 'Mall of the Emirates']],
  ['jumeirah', 'Jumeirah', 'Jumeirah', 'Dubai', 25.2048, 55.239, ['Umm Suqeim', 'Al Safa', 'Al Wasl']],
  ['deira', 'Deira', 'Deira', 'Dubai', 25.271, 55.3095, ['Al Rigga', 'Port Saeed', 'Al Muraqqabat']],
  ['bur-dubai', 'Bur Dubai', 'Bur Dubai', 'Dubai', 25.2532, 55.2972, ['Al Karama', 'Al Mankhool', 'Oud Metha']],
  ['mirdif', 'Mirdif', 'Mirdif', 'Dubai', 25.2175, 55.419, ['Uptown Mirdif', 'Al Warqa']],
  ['dubai-silicon-oasis', 'Dubai Silicon Oasis', 'Silicon Oasis', 'Dubai', 25.1212, 55.3773, ['DSO', 'Academic City']],
  ['international-city', 'International City', 'International City', 'Dubai', 25.1645, 55.4084, ['Dragon Mart', 'Warsan']],
  ['arabian-ranches', 'Arabian Ranches', 'Arabian Ranches', 'Dubai', 25.052, 55.266, ['Motor City', 'Dubai Sports City']],
  ['al-nahda-sharjah', 'Al Nahda, Sharjah', 'Al Nahda', 'Sharjah', 25.304, 55.376, ['Sahara Centre']],
  ['al-majaz', 'Al Majaz', 'Al Majaz', 'Sharjah', 25.3255, 55.383, ['Buhaira Corniche', 'Al Majaz Waterfront']],
  ['al-khan', 'Al Khan', 'Al Khan', 'Sharjah', 25.327, 55.369, ['Al Mamzar, Sharjah']],
  ['al-taawun', 'Al Taawun', 'Al Taawun', 'Sharjah', 25.311, 55.374, ['Expo Centre Sharjah']],
  ['muwaileh', 'Muwaileh', 'Muwaileh', 'Sharjah', 25.299, 55.46, ['University City', 'Al Zahia']],
  ['al-nuaimiya', 'Al Nuaimiya', 'Al Nuaimiya', 'Ajman', 25.389, 55.456, ['Nuaimiya Towers']],
  ['al-rashidiya-ajman', 'Al Rashidiya, Ajman', 'Al Rashidiya', 'Ajman', 25.394, 55.442, ['Ajman One', 'Horizon Towers']],
  ['ajman-corniche', 'Ajman Corniche', 'Ajman Corniche', 'Ajman', 25.411, 55.435, ['Corniche Residence']],
  ['al-jurf', 'Al Jurf', 'Al Jurf', 'Ajman', 25.418, 55.486, ['Ajman Uptown', 'Al Hamidiya']],
].map(([slug, name, short, emirate, lat, lng, aliases]) => ({ slug, name, short, emirate, lat, lng, aliases }));

const hash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

function areaStats(area) {
  if (area.slug === 'barsha-heights-tecom') return { homes: 62, rating: 4.8, share: 9, topPest: 'cockroach' };
  const h = hash(area.slug);
  return { homes: 18 + (h % 48), rating: [4.7, 4.8, 4.9][h % 3], share: 6 + (h % 4), topPest: 'cockroach', sample: true };
}

// Verified Akkad jobs shown as "What your neighbors say". SAMPLE content.
const NEIGHBOR_REVIEWS = [
  { initials: 'RM', name: 'R. M.', home: '1-bed apartment', pest: 'cockroach', method: 'gel and spray', date: '3 Nov 2026', stars: 5, text: 'Kitchen was clear in two days. The technician explained every step.', arrived: 28, photo: 'Photo of the work: gel under the kitchen sink' },
  { initials: 'SA', name: 'S. A.', home: '2-bed apartment', pest: 'cockroach', method: 'gel and spray', date: '28 Oct 2026', stars: 5, text: 'Booked at lunch and the team was at my door within the hour.', arrived: 34, photo: 'Photo of the work: bathroom drain treatment' },
  { initials: 'PK', name: 'P. K.', home: 'Studio', pest: 'cockroach', method: 'gel', date: '21 Oct 2026', stars: 5, text: 'Price was exactly what the website showed. No surprises.', arrived: 25, photo: 'Photo of the work: gel behind the fridge' },
  { initials: 'LN', name: 'L. N.', home: '1-bed apartment', pest: 'bedbugs', method: 'spray and steam', date: '14 Oct 2026', stars: 5, text: 'Two visits as promised. We have slept well ever since.', arrived: 31, photo: 'Photo of the work: mattress treatment' },
  { initials: 'OH', name: 'O. H.', home: '3-bed apartment', pest: 'cockroach', method: 'gel and spray', date: '9 Oct 2026', stars: 4, text: 'Very careful around our cat and explained what was safe.', arrived: 29, photo: 'Photo of the work: kitchen cabinet hinges' },
  { initials: 'DT', name: 'D. T.', home: '2-bed apartment', pest: 'ants', method: 'gel bait', date: '2 Oct 2026', stars: 5, text: 'Ant trail on the balcony was gone in three days.', arrived: 27, photo: 'Photo of the work: balcony bait points' },
  { initials: 'FA', name: 'F. A.', home: '1-bed apartment', pest: 'bedbugs', method: 'spray and steam', date: '25 Sep 2026', stars: 5, text: 'Discreet van, polite team and a clear report on WhatsApp.', arrived: 33, photo: 'Photo of the work: bed frame treatment' },
  { initials: 'JC', name: 'J. C.', home: '2-bed apartment', pest: 'cockroach', method: 'gel and spray', date: '18 Sep 2026', stars: 5, text: 'They came back free when I saw one more. Warranty is real.', arrived: 30, photo: 'Photo of the work: drain treatment' },
];

// Google reviews. SAMPLE content: connect the Google Business Profile to replace.
const GOOGLE_REVIEWS = [
  { initials: 'AK', name: 'A. K.', when: '2 weeks ago', area: 'Dubai Marina', stars: 5, text: 'Cockroaches in our kitchen were gone after one visit. Price was exactly as quoted.' },
  { initials: 'SR', name: 'S. R.', when: '3 weeks ago', area: 'Al Nahda', stars: 5, text: 'They came the same day and I could watch the van on the map.' },
  { initials: 'MH', name: 'M. H.', when: '3 weeks ago', area: 'Barsha Heights', stars: 5, text: 'The team explained the treatment at our apartment and arrived on time.' },
  { initials: 'JL', name: 'J. L.', when: '1 month ago', area: 'Barsha Heights', stars: 5, text: 'Quick, tidy and honest about what we needed. Paid with Tabby.' },
  { initials: 'NB', name: 'N. B.', when: '1 month ago', area: 'JVC', stars: 5, text: 'Bed bugs treated in two visits. The warranty visit was free as promised.' },
  { initials: 'TW', name: 'T. W.', when: '2 months ago', area: 'Al Nuaimiya', stars: 4, text: 'Good service and safe with our toddler at home. Would book again.' },
];

const FAQ = [
  ['Is the treatment safe for children and pets?', 'Yes. We use Dubai Municipality-approved products and the technician explains on site what was applied and where. For gel treatments there is no need to leave home.'],
  ['What does the warranty cover?', 'If the same pest returns during your warranty period, we come back and treat again at no charge. Only an express call-out carries a small fee; a scheduled warranty visit costs nothing.'],
  ['How soon can you come?', 'If a team is working near you, an express visit reaches you in about 30 minutes. Otherwise pick any open slot, usually from the next day.'],
  ['How do I pay?', 'By credit or debit card on a secure checkout page, or with Tabby in 4 payments if eligible. You see the full total, VAT included, before you pay.'],
  ['Do I need to leave home?', 'For gel treatments, no. For sprays we ask you to keep rooms closed for a short time; the technician will tell you exactly how long.'],
];

const WHY = [
  ['card', 'Price before we arrive', 'The total you see is the total you pay.'],
  ['check', 'Safe for children and pets', 'Municipality-approved products, explained on site.'],
  ['shield', 'Pests return? We return free', 'Covered call-outs during your warranty.'],
  ['truck', 'On time, with live tracking', 'Watch your technician arrive.'],
  ['calendar', 'Pay your way', 'Card or Tabby in 4 payments.'],
];

module.exports = { COMPANY, FEES, PESTS, AREAS, areaStats, NEIGHBOR_REVIEWS, GOOGLE_REVIEWS, FAQ, WHY, shortSize };
