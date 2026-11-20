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
  // Calls go to the office landline; WhatsApp goes to the mobile number.
  phone: '04 425 1557',
  phoneHref: 'tel:+97144251557',
  whatsapp: 'https://wa.me/971504001344',
  whatsappNumber: '+971 50 400 1344',
  address: 'Sheikha Noora Tower, Office 403, Barsha Heights (Tecom), Dubai',
  building: 'Sheikha Noora Tower, Office 403',
  district: 'Barsha Heights (Tecom), Dubai, UAE',
  // Office location on the map. Check the pin and adjust lat/lng if needed.
  lat: 25.0969,
  lng: 55.1746,
  // Akkad's Google business listing (address, map, reviews).
  mapsUrl: 'https://share.google/dDQepk50PiM6oUOwk',
  mapsQuery: 'Akkad Pest Control Services, Sheikha Noora Tower, Barsha Heights, Dubai',
  // Leave empty to hide. Example: 'info@pestcontrol.ae', 'Every day, 8am to 10pm'.
  email: '',
  hours: '',
  domain: 'pestcontrol.ae',
  googleReviewsUrl: 'https://www.google.com/search?q=Akkad+Pest+Control+Services+Dubai+reviews',
  rating: 4.8,
};

const FEES = { expressNew: 18, expressWarranty: 39, etaMin: 28, aboutMin: 30 };

const APT = ['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4 bedrooms'];
const VILLA = ['2 bedrooms', '3 bedrooms', '4 bedrooms', '5 bedrooms', '6+ bedrooms'];
// `beds` lets the size picker count bedrooms up and down (Studio = 0); sizes without it are listed as other options.
const bedsOf = (label) => (label === 'Studio' ? 0 : /^(\d+) bedrooms?$/.test(label) ? Number(label.split(' ')[0]) : null);
const sizes = (labels, prices) => labels.map((label, i) => ({ id: 's' + i, label, price: prices[i], beds: bedsOf(label) }));
const shortSize = (homeType, label) => {
  const home = homeType === 'villa' ? 'villa' : 'apt';
  if (label === 'Studio') return 'studio';
  if (/^\d+ bedrooms?$/.test(label)) return label.replace(/ bedrooms?/, '-bed') + ' ' + home;
  return `${home === 'apt' ? 'apartment' : 'villa'}, ${label.charAt(0).toLowerCase() + label.slice(1)}`;
};

// A pest has packages. A package is either fixed-price or sized (apartment / villa).
const PESTS = [
  {
    // One visit that covers the common household pests together. SAMPLE prices: replace with Akkad's own.
    id: 'general', name: 'General', single: 'common household pests', service: 'General pest control', short: 'General', general: true,
    signs: 'Cockroaches, ants, spiders and other crawling insects', from: 99, warrantyMonths: 3, sample: true,
    blurb: 'One treatment for the common household pests: cockroaches, ants, spiders, silverfish and other crawling insects.',
    intro: 'One treatment for the common household pests: cockroaches, ants, spiders and other crawling insects.',
    photo: 'Photo: technician treating a kitchen',
    prep: 'Clear kitchen counters and keep pets in one room.',
    steps: [
      ['Inspect', 'Checks kitchen, bathrooms, balcony and entry points.'],
      ['Treat', 'Gel and spray for crawling insects with municipality-approved products.'],
      ['Explain and hand over', 'Shows what was done, gives safety advice, starts your warranty.'],
    ],
    packages: [
      { id: 'apartment', title: 'General pest control: apartment', badge: 'MOST BOOKED', duration: '45–60 mins', sized: 'apartment',
        photo: 'Photo: apartment treatment', points: ['Cockroaches, ants, spiders and crawling insects', 'Whole apartment, kitchen and bathrooms'] },
      { id: 'villa', title: 'General pest control: villa', duration: '60–90 mins', sized: 'villa',
        photo: 'Photo: villa treatment', points: ['Cockroaches, ants, spiders and crawling insects', 'Whole villa and garden perimeter'] },
    ],
    sizes: { apartment: sizes(APT, [99, 129, 159, 199, 239]), villa: sizes(VILLA, [249, 299, 349, 399, 449]) },
  },
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
    blurb: 'Targeted treatment for mattresses, furniture and the places bed bugs hide.',
    intro: 'Targeted treatment for mattresses, furniture and the places bed bugs hide.',
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

// Real photos in public/img, by the label of the photo slot they fill.
// Any slot without a photo here shows a labelled placeholder. Package cards
// without their own photo use the photo of their service.
const PHOTOS = {
  'Photo: gel treatment in a kitchen': '/img/cockroach-gel-kitchen.webp',
  'Photo: gel in kitchen cabinet': '/img/cockroach-gel-kitchen.webp',
  'Photo: mattress inspection': '/img/bedbug-bed-frame.webp',
  'Photo: bedroom treatment': '/img/bedbug-bed-frame.webp',
  'Photo: villa bedroom treatment': '/img/bedbug-bed-frame.webp',
  'Photo: ant bait placement': '/img/ant-gel-skirting.webp',
  'Photo: bait station placement': '/img/rodent-bait-station.webp',
  'Photo: termite inspection': '/img/termite-soil-treatment.webp',
  'Photo: garden fogging': '/img/mosquito-garden-fogging.webp',
  'Photo: fly treatment near bins': '/img/fly-light-trap.webp',
  'Photo: commercial kitchen inspection': '/img/commercial-kitchen-inspection.webp',
  // Homepage
  'Photo: technician treating a kitchen': '/img/cockroach-gel-kitchen.webp',
  "Photo: Akkad technician at a customer's door": '/img/rodent-bait-station.webp',
  'Photo: technician explaining the treatment': '/img/akkad-team.jpg',
  // Neighbour reviews ("photo of the work")
  'Photo of the work: gel under the kitchen sink': '/img/cockroach-gel-kitchen.webp',
  'Photo of the work: gel behind the fridge': '/img/cockroach-gel-kitchen.webp',
  'Photo of the work: kitchen cabinet hinges': '/img/cockroach-gel-kitchen.webp',
  'Photo of the work: mattress treatment': '/img/bedbug-bed-frame.webp',
  'Photo of the work: bed frame treatment': '/img/bedbug-bed-frame.webp',
  'Photo of the work: balcony bait points': '/img/ant-gel-skirting.webp',
};

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

// Service details shown on the cards and in the size picker: what each package covers,
// what the technician does, how to prepare and what to expect afterwards.
// DRAFT wording: check each line against how Akkad actually carries out the job.
const DETAILS = {
  general: {
    points: { apartment: ['Cockroaches, ants, spiders, silverfish and other crawling insects', 'Kitchen, bathrooms, bedrooms, living room and balcony', 'Gel in cabinets and hinges, spray along skirting and drains', 'Odourless products, safe for children and pets once dry'],
      villa: ['Cockroaches, ants, spiders, silverfish and other crawling insects', 'All rooms, kitchens, bathrooms and maid’s room', 'Outdoor drains, manholes and the garden perimeter', 'Odourless products, safe for children and pets once dry'] },
    after: 'You may see more insects for a few days as they leave their hiding places. Avoid mopping along the skirting for 3 days so the treatment keeps working.',
  },
  cockroach: {
    points: { kitchen: ['Gel in cabinets, hinges, under the sink and behind appliances', 'Food-safe gel: no need to empty cupboards or leave home', 'Best for cockroaches seen only in the kitchen', 'Most kitchens are clear within 3 to 5 days'],
      apartment: ['Whole apartment: kitchen, bathrooms, bedrooms and balcony', 'Gel in cabinets and hinges, spray in drains and service shafts', 'Treats German and American cockroaches', 'Safe for children and pets once dry'],
      villa: ['Whole villa: kitchens, bathrooms, rooms and maid’s room', 'Outdoor drains, manholes and the garbage area', 'Garden perimeter spray to stop them coming back in', 'Safe for children and pets once dry'] },
    after: 'Seeing a few slow or dead cockroaches in the first days is normal: the gel is working through the colony. Do not spray shop insecticide, it spoils the gel.',
  },
  bedbugs: {
    points: { room: ['Mattress, bed frame, headboard and bedside furniture', 'Spray and steam into seams, joints and skirting', 'Second visit after 14 days for newly hatched bugs', 'Room ready to use again after about 4 hours'],
      apartment: ['All bedrooms, sofas, curtains and the living area', 'Spray and steam into seams, joints and skirting', 'Second visit after 14 days for newly hatched bugs', 'Rooms ready to use again after about 4 hours'],
      villa: ['All bedrooms, majlis, sofas and the maid’s room', 'Spray and steam into seams, joints and skirting', 'Second visit after 14 days for newly hatched bugs', 'Rooms ready to use again after about 4 hours'] },
    steps: [
      ['Inspection', 'We inspect mattress seams, bed frames, headboards, sofas and nearby furniture for signs of bed bugs.'],
      ['Mattress edge and seam treatment', 'We spray suitable mattress edges, seams and folds using a product specifically permitted for those areas.'],
      ['Misting treatment', 'Where suitable, we apply controlled misting to affected furniture areas according to the selected product\'s instructions.'],
      ['Targeted spray treatment', 'We treat identified hiding places in bed-frame joints, furniture undersides, headboard crevices and skirting gaps.'],
      ['Puff treatment', 'Where needed, we apply insecticidal dust inside suitable concealed gaps and voids. Electrical areas require a separate professional assessment.'],
      ['Service report and follow-up guidance', 'We explain the treatment completed, when treated furniture can be used, and any further visit included in your booking.'],
    ],
    after: 'Keep the room closed for about 4 hours, then air it. Do not move furniture between rooms before the second visit.',
  },
  ants: {
    points: { apartment: ['Kitchen, bathrooms, balcony and every ant trail', 'Gel bait that workers carry back to the nest', 'Barrier spray at doors, windows and pipe entries', 'Safe for children and pets'],
      villa: ['All rooms, kitchens and outdoor seating areas', 'Gel bait that workers carry back to the nest', 'Nests treated in the garden, paving and boundary walls', 'Safe for children and pets'] },
    steps: [['Inspect', 'Follows the trails to find the nest and how the ants get in.'], ['Treat', 'Places gel bait on the trails and sprays a barrier at entry points.'], ['Explain and hand over', 'Shows where bait was placed, gives safety advice, starts your warranty.']],
    prep: 'Wipe up food spills, but leave the ant trails alone so the technician can follow them.',
    after: 'Ants keep visiting the bait for a few days: that is how it reaches the nest. Do not wipe the bait or spray over it.',
  },
  rodents: {
    points: { apartment: ['Tamper-proof bait stations and traps in the right places', 'Entry points found: pipes, AC ducts and door gaps', 'Follow-up visit to check stations and remove rodents', 'Stations are locked: safe around children and pets'],
      villa: ['Bait stations indoors, in the garden and along boundary walls', 'Entry points found: drains, roof, garage and door gaps', 'Follow-up visit to check stations and remove rodents', 'Stations are locked: safe around children and pets'] },
    steps: [['Inspect', 'Looks for droppings, gnaw marks and the gaps rodents use to get in.'], ['Treat', 'Sets locked bait stations and traps along their runs.'], ['Follow up', 'Checks the stations, removes rodents and advises how to seal entry points.']],
    prep: 'Store food in sealed containers and tell us where you have seen droppings or heard noises.',
    after: 'Do not move the bait stations. Activity usually drops within a week; call us if you find a dead rodent and we will collect it.',
  },
  mosquitoes: {
    points: { apartment: ['Balcony, drains and standing water treated', 'Larvicide where mosquitoes breed', 'Residual spray where they rest: walls, plants and corners', 'Safe to use the balcony again after about 2 hours'],
      villa: ['Garden, pool area, drains and boundary walls', 'Fogging of plants and shaded resting places', 'Larvicide in standing water and drains', 'Safe to use the garden again after about 2 hours'] },
    steps: [['Inspect', 'Finds standing water and the shaded places where mosquitoes rest.'], ['Treat', 'Applies larvicide to breeding spots and fogs or sprays resting places.'], ['Explain and hand over', 'Shows how to remove breeding spots, starts your warranty.']],
    prep: 'Empty plant saucers and buckets, cover fish ponds, and keep windows closed during the treatment.',
    after: 'Stay off treated outdoor areas for about 2 hours. Empty standing water every week to keep them away.',
  },
  flies: {
    points: { apartment: ['Kitchen, bin area, balcony and drains', 'Bait and residual spray where flies land and rest', 'Breeding sources found and treated', 'Safe for children and pets once dry'],
      villa: ['Kitchens, garbage area, garden and outdoor seating', 'Bait and residual spray where flies land and rest', 'Drains and breeding sources treated', 'Safe for children and pets once dry'] },
    steps: [['Inspect', 'Finds where the flies breed: bins, drains and food waste.'], ['Treat', 'Applies bait and residual spray to resting and breeding places.'], ['Explain and hand over', 'Gives hygiene advice that keeps them away, starts your warranty.']],
    prep: 'Empty and close the bins, and cover or put away food.',
    after: 'Keep bins closed and drains clean. Fly numbers usually fall within 2 to 3 days.',
  },
};
for (const p of PESTS) {
  const d = DETAILS[p.id];
  if (!d) continue;
  if (d.steps) p.steps = d.steps;
  if (d.prep) p.prep = d.prep;
  p.after = d.after;
  for (const pk of p.packages) if (d.points[pk.id]) pk.points = d.points[pk.id];
}

/* ---------- PRICES: Akkad first-offer price list (sheet transcribed 19 November 2026) ----------
   All amounts in AED, VAT included. Edit the numbers here when the price list changes. */
const beds = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `${from + i} bedroom${from + i > 1 ? 's' : ''}`);
const APT_LABELS = ['Studio', ...beds(1, 6)];
const APT_PRICES = [189, 210, 262.5, 367.5, 420, 472.5, 525];
const VILLA_LABELS = [...beds(1, 8), 'Common areas only', 'Common areas + outside'];
const VILLA_PRICES = [315, 472.5, 525, 577.5, 630, 735, 840, 935, 210, 367.5];
const byId = Object.fromEntries(PESTS.map((p) => [p.id, p]));
const fixed = (p, id, name, price, duration, points) => ({ id, title: `${p.service}: ${name}`, label: `${p.service} · ${name}`, price, duration, points });
const NO_WARRANTY_AFTER = 'This service is 2 visits with no warranty. The second visit is arranged with you after the first.';

// General pest control. The sheet's apartment and villa tables.
byId.general.sizes = { apartment: sizes(APT_LABELS, APT_PRICES), villa: sizes(VILLA_LABELS, VILLA_PRICES) };
byId.general.from = APT_PRICES[0];
delete byId.general.sample;

// ASSUMPTION: the sheet has no separate cockroach, ant or fly prices, so they use the general table.
for (const id of ['cockroach', 'ants', 'flies']) {
  byId[id].sizes = { apartment: sizes(APT_LABELS, APT_PRICES), villa: sizes(VILLA_LABELS, VILLA_PRICES) };
  byId[id].from = APT_PRICES[0];
  delete byId[id].sample; byId[id].assumedPrices = true;
}

// Cockroach control is sold exactly like general pest control: apartment or villa, by bedrooms (no kitchen-only package).
byId.cockroach.packages = byId.cockroach.packages.filter((pk) => pk.id !== 'kitchen');
byId.cockroach.packages[0].badge = 'BESTSELLER';

// Bed bugs. Apartments from the sheet; villas are the villa bedroom price + AED 30 per mattress.
{
  const p = byId.bedbugs;
  p.packages = p.packages.filter((pk) => pk.id !== 'room');
  p.packages[0].badge = 'MOST BOOKED';
  p.sizes = {
    apartment: sizes(['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4 bedrooms', '2 bedrooms, 5–6 mattresses'], [210, 262.5, 315, 420, 472.5, 367.5]),
    villa: sizes(beds(1, 8), VILLA_PRICES.slice(0, 8)),
  };
  p.sizes.apartment[2].note = '3–4 mattresses';
  p.packages.find((pk) => pk.id === 'villa').perMattress = 30;
  p.from = 210; delete p.sample;
}
// Bed bugs with general pest control (apartments, 3 mattresses unless stated).
PESTS.splice(PESTS.indexOf(byId.bedbugs) + 1, 0, {
  id: 'bedbugs-general', name: 'Bed bugs + general', single: 'bed bugs and household pests', service: 'Bed bugs + general pest control', short: 'Bed bugs + general', general: true,
  signs: 'Bed bugs and other household pests in one visit plan', from: 283.5, warrantyMonths: byId.bedbugs.warrantyMonths, visits: '2 visits',
  blurb: 'Bed bug treatment and general pest control together, at one combined price.',
  intro: 'Bed bug treatment and general pest control together, at one combined price.',
  photo: 'Photo: mattress inspection', prep: byId.bedbugs.prep, steps: byId.bedbugs.steps, after: byId.bedbugs.after,
  packages: [{ id: 'apartment', title: 'Bed bugs + general pest control: apartment', duration: '2 visits', sized: 'apartment', photo: 'Photo: bedroom treatment',
    points: ['Bed bug treatment for up to 3 mattresses, bed frames and furniture', 'General pest control for the whole apartment', 'Second bed bug visit after 14 days', 'Rooms ready to use again after about 4 hours'] }],
  sizes: { apartment: sizes(['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4 bedrooms', '1 bedroom, 8 mattresses', 'Room with 6–8 partitions (6 mattresses)'], [283.5, 330.75, 367.5, 420, 472.5, 472.5, 630]) },
});

// Additional services on the sheet: fixed price, 2 visits only, no warranty.
{
  const r = byId.rodents;
  Object.assign(r, { warrantyMonths: 0, visits: '2 visits', from: 262.5, after: NO_WARRANTY_AFTER });
  delete r.sample; delete r.sizes;
  r.packages = [
    fixed(r, 'rbs', 'bait stations (RBS)', 262.5, '2 visits', ['Black tamper-proof boxes containing rat poison', 'Placed along the runs rodents use', 'Boxes are locked: safe around children and pets', '2 visits, no warranty']),
    fixed(r, 'traps', 'rat traps (indoor)', 262.5, '2 visits', ['Traps set indoors where rodents are active', 'No poison used inside your home', 'Second visit to check and reset the traps', '2 visits, no warranty']),
  ];
  r.packages[0].badge = 'MOST BOOKED'; r.packages[0].photo = 'Photo: bait station placement'; r.packages[1].photo = 'Photo: bait station placement';
  const m = byId.mosquitoes;
  Object.assign(m, { warrantyMonths: 0, visits: '2 visits', from: 262.5, after: NO_WARRANTY_AFTER });
  delete m.sample; delete m.sizes;
  m.packages = [
    fixed(m, 'misting', 'indoor misting', 262.5, '2 visits', ['Fine mist treatment indoors only', 'Reaches the corners and curtains where mosquitoes rest', 'Rooms ready to use again after about 2 hours', '2 visits, no warranty']),
    fixed(m, 'fogging', 'fogging with full outdoor spray', 315, '2 visits', ['Outdoor only: garden, plants and boundary walls', 'Fogging plus a full outdoor spray', 'Garden ready to use again after about 2 hours', '2 visits, no warranty']),
  ];
  m.packages[0].photo = 'Photo: garden fogging'; m.packages[1].photo = 'Photo: garden fogging'; m.packages[1].badge = 'MOST BOOKED';
  const w = { id: 'wasps', name: 'Wasps & bees', single: 'wasps and bees', service: 'Wasp nest and beehive removal', short: 'Wasp / bee', general: true,
    signs: 'A nest or hive on the building or in the garden', from: 262.5, warrantyMonths: 0, visits: '2 visits',
    blurb: 'Outdoor spray treatment and removal of a wasp nest or beehive.', intro: 'Outdoor spray treatment and removal of a wasp nest or beehive.',
    photo: 'Photo: garden fogging', prep: 'Keep children and pets indoors and close nearby windows. Tell us where the nest is and how high.',
    steps: [['Inspect', 'Locates the nest or hive and checks safe access.'], ['Treat', 'Sprays the nest from outside with municipality-approved products.'], ['Remove', 'Removes the nest where it can be reached, and returns for the second visit.']],
    after: NO_WARRANTY_AFTER };
  w.packages = [fixed(w, 'nest', 'outdoor spray', 262.5, '2 visits', ['Outdoor spray on the nest or hive', 'Nest removed where it can be safely reached', 'Protective equipment used throughout', '2 visits, no warranty'])];
  w.packages[0].photo = 'Photo: garden fogging';
  PESTS.splice(PESTS.indexOf(byId.mosquitoes) + 1, 0, w);
}
// On the sheet but not bookable online yet: handwritten annual contract rates (2 to 9 bedrooms, AED 1,050 to 2,520).
const ANNUAL_CONTRACT = { 2: 1050, 3: 1260, 4: 1470, 5: 1680, 6: 1890, 7: 2100, 8: 2310, 9: 2520 };
const MAX_MATTRESSES = 20;

// WARRANTY (confirmed by Akkad, 20 November 2026): 6 months with unlimited call-outs on general,
// cockroach, ant and bed bug treatments. Flies: 6 months with two follow-up visits.
// Rodents, mosquitoes and wasps stay as on the price sheet: 2 visits, no warranty.
for (const id of ['general', 'cockroach', 'ants', 'bedbugs', 'bedbugs-general']) Object.assign(PESTS.find((p) => p.id === id), { warrantyMonths: 6, callouts: 'Unlimited call-outs' });
Object.assign(byId.flies, { warrantyMonths: 6, callouts: '2 follow-up visits' });

// ONE-TIME general pest control: a single visit with no warranty and no call-outs.
// Fixed prices confirmed by Akkad: apartment AED 99, villa AED 210 (no size steps until Akkad sends per-bedroom prices).
const ONCE_APT_PRICE = 99;
{
  const g = byId.general;
  const NOTE = 'One visit, no warranty or call-outs';
  PESTS.splice(PESTS.indexOf(g) + 1, 0, {
    id: 'general-once', name: 'One-time visit', single: g.single, service: 'One-time general pest control', short: 'One-time general', general: true,
    signs: g.signs, from: ONCE_APT_PRICE, warrantyMonths: 0, visits: '1 visit', noWarrantyLabel: 'One-time visit, no warranty',
    blurb: 'A single general pest control visit at a lower price. No warranty and no call-outs.',
    intro: 'A single general pest control visit at a lower price. No warranty and no call-outs.',
    photo: g.photo, prep: g.prep,
    steps: [g.steps[0], g.steps[1], ['Explain and hand over', 'Shows what was done and gives safety advice.']],
    after: 'This is a one-time visit with no warranty. For 6 months of cover with unlimited call-outs, choose general pest control instead.',
    packages: [
      { id: 'apartment', title: 'One-time general pest control: apartment', label: 'One-time general pest control · apartment', price: ONCE_APT_PRICE, duration: '45–60 mins', photo: 'Photo: apartment treatment',
        points: ['Cockroaches, ants, spiders and crawling insects', 'Whole apartment, kitchen and bathrooms', NOTE] },
      { id: 'villa', title: 'One-time general pest control: villa', label: 'One-time general pest control · villa', price: 210, duration: '60–90 mins', photo: 'Photo: villa treatment',
        points: ['Cockroaches, ants, spiders and crawling insects', 'Inside the villa', NOTE] },
    ],
  });
}

// WHAT THE TECHNICIAN DOES (wording supplied by Akkad, 20 November 2026).
// Each step is [title, explanation, picture]; `null` shows the step without a picture.
{
  const PIC = { inspect: '/img/step-inspect.webp', spray: '/img/step-treat.webp', report: '/img/step-explain.webp', skirting: '/img/ant-gel-skirting.webp',
    hinge: '/img/job-hinge.webp', hinge2: '/img/job-hinge-2.webp', shower: '/img/job-drain-shower.webp', outdoorDrain: '/img/job-drain-outdoor.webp', sink: '/img/job-drain-sink.webp' };
  const CRAWLING = [
    ['Inspection', 'We inspect kitchens, bathrooms, cabinets, appliance gaps and other affected areas to locate pest activity and possible entry routes.', PIC.inspect],
    ['Cabinet gel treatment', 'We place small amounts of suitable gel in concealed cabinet joints and hinge areas, away from food and food-contact surfaces.', PIC.hinge],
    ['Crack and skirting gel treatment', 'We apply suitable gel inside selected wall cracks, crevices and skirting gaps where pests travel or hide.', PIC.skirting],
    ['Electrical-area assessment', 'We inspect gaps around electrical fittings. Any treatment near these areas follows a suitable product and professional procedure.', null],
    ['Ant bait stations', 'Where appropriate, we position ant bait stations near identified trails or entry points to support control of the colony.', null],
    ['Targeted spray treatment', 'Where needed, we spray suitable hiding places and entry points, keeping spray treatment separate from gel and bait placements.', PIC.sink],
    ['Additional bait stations (optional service)', 'Extra ant or cockroach bait stations are available where recommended. Any additional cost is explained before installation.', null],
    ['Service report and prevention advice', 'We explain the areas treated, which placements to leave undisturbed, and how to reduce food, moisture and pest access.', PIC.report],
  ];
  const OUTDOOR = [
    ['Outdoor inspection', 'We inspect accessible exterior walls, entrances, patio edges, garden borders and agreed drainage points.', null],
    ['Exterior wall and entry-point treatment', 'We treat suitable wall-base gaps, cracks, door surrounds and service-pipe openings where pest activity is identified.', null],
    ['Patio and paving-edge treatment', 'We apply targeted treatment to suitable paving joints, patio edges and sheltered structural gaps.', null],
    ['Garden activity-point treatment', 'We treat selected pest activity points around garden borders, sheltered ground-level areas and suitable landscaping features.', null],
    ['Drainage-chamber treatment (when included)', 'We inspect accessible chambers and treat suitable pest harbourage surfaces where the product permits. Drain cleaning and repairs are separate services.', PIC.outdoorDrain],
    ['Outdoor ant bait or granules (where suitable)', 'We use an appropriate bait station or labelled granular treatment at identified ant activity points.', null],
    ['Service report and recommendations', 'We record the treatment completed and explain any entry gaps, moisture problems or maintenance issues needing attention.', PIC.report],
  ];
  const TAG = 'Precision treatment for active trails, hidden pests and entry points, with gels and baits selected for the pest.';
  for (const id of ['cockroach', 'ants']) Object.assign(byId[id], { steps: CRAWLING, outdoorSteps: OUTDOOR, blurb: TAG, intro: TAG });

  const GTAG = 'Inspection, targeted treatment and continued support for the crawling pests covered by your booking.';
  Object.assign(byId.general, { blurb: GTAG, intro: GTAG, outdoorSteps: OUTDOOR,
    steps: [
      ['Inspect the property', 'We check the booked areas for pest activity, hiding places and entry points.', PIC.inspect],
      ['Apply suitable gel treatment', 'We place pest-specific gel in selected concealed cabinet joints, cracks and crevices.', PIC.hinge],
      ['Carry out targeted spray treatment', 'We treat suitable indoor activity points without disturbing gel or bait placements.', PIC.shower],
      ['Treat included outdoor areas', 'For villa packages with outdoor coverage, we treat the relevant exterior activity points and included drainage areas.', PIC.outdoorDrain],
      ['Explain your service report', 'We review the work completed, aftercare instructions and warranty support.', PIC.report],
    ],
    stepNotes: [['Apartment', 'Treatment covers the indoor areas included in your booking.'], ['Villa', 'Indoor, outdoor and drainage coverage follow your selected package.']] });

  // One-time visit. Akkad's draft text mentioned a six-month warranty here; left out because this service is sold with no warranty.
  Object.assign(PESTS.find((p) => p.id === 'general-once'), {
    steps: [
      ['Inspect', 'We identify the pest problem and assess the areas included in your booking.', PIC.inspect],
      ['Apply gel where suitable', 'We place suitable gel at selected concealed hiding points.', PIC.hinge2],
      ['Apply targeted spray where needed', 'We treat suitable indoor areas and any outdoor areas included in your selected package.', PIC.spray],
      ['Report and explain', 'We provide your service report and aftercare instructions.', PIC.report],
    ],
    stepNotes: [['Apartment', 'Indoor treatment within the booked scope.'], ['Villa', 'Treatment of the indoor and outdoor areas selected when booking.']] });
}
for (const p of PESTS) if (!p.inspection) p.warrantyLabel = p.warrantyMonths ? `${p.warrantyMonths}-month warranty` : (p.noWarrantyLabel || '2 visits, no warranty');

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
  ['What does the warranty cover?', 'Our warranty is 6 months with unlimited call-outs. If the same pest returns, we come back and treat again at no charge, as many times as needed. Only an express call-out carries a small fee. The AED 99 one-time visit has no warranty.'],
  ['When do you refund?', 'In two cases: if we did not carry out the treatment, or if you paid twice by mistake. See the refund policy for details.'],
  ['How soon can you come?', 'If a team is working near you, an express visit reaches you in about 30 minutes. Otherwise pick any open slot, usually from the next day.'],
  ['How do I pay?', 'By credit or debit card on a secure checkout page, or with Tabby in 4 payments if eligible. You see the full total, VAT included, before you pay.'],
  ['Do I need to leave home?', 'For gel treatments, no. For sprays we ask you to keep rooms closed for a short time; the technician will tell you exactly how long.'],
];

const WHY = [
  ['card', 'Price before we arrive', 'The total you see is the total you pay.'],
  ['check', 'Safe for children and pets', 'Municipality-approved products, explained on site.'],
  ['shield', 'Pests return? We return free', '6-month warranty, unlimited call-outs.'],
  ['truck', 'On time, with live tracking', 'Watch your technician arrive.'],
  ['calendar', 'Pay your way', 'Card or Tabby in 4 payments.'],
];

module.exports = { ANNUAL_CONTRACT, MAX_MATTRESSES, COMPANY, PHOTOS, FEES, PESTS, AREAS, areaStats, NEIGHBOR_REVIEWS, GOOGLE_REVIEWS, FAQ, WHY, shortSize };
