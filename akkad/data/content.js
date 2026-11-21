// Text for the service pages (/services/...). Edit freely: the pages are built from this file.
// Prices, packages and treatment steps come from catalog.js, so they are not repeated here.

const SERVICES = {
  cockroach: {
    slug: 'cockroach-control',
    title: 'Cockroach control in Dubai, Sharjah and Ajman',
    lead: 'Gel and spray treatment that reaches the nests hidden in kitchens, bathrooms and drains, so cockroaches stop coming back.',
    signs: ['Cockroaches running when you switch on the kitchen light', 'Small dark droppings in cabinets, drawers or behind appliances', 'Egg cases near the sink, fridge or oven', 'A musty, oily smell in closed cupboards'],
    causes: ['Warm, humid kitchens and bathrooms all year round', 'Shared drains and service ducts in apartment buildings', 'Cardboard boxes and deliveries that bring them in', 'Food crumbs and water left overnight'],
    prevention: ['Wipe counters and sweep floors every evening', 'Keep food in sealed containers, including pet food', 'Fix dripping taps and dry the sink before bed', 'Remove cardboard boxes soon after delivery', 'Keep drain covers closed'],
    faq: [
      ['How soon will I see results?', 'Most homes see far fewer cockroaches within 3 to 5 days, as the gel works through the colony. Seeing a few slow, dying cockroaches in the first days is normal.'],
      ['Do I need to leave home?', 'For gel treatment, no. For spray, we ask you to stay out of the treated rooms for about 2 hours and keep children and pets away until surfaces are dry.'],
      ['What if they come back?', 'Your treatment comes with a warranty. If cockroaches return during the warranty, book a free warranty visit with your booking number.'],
    ],
  },
  bedbugs: {
    slug: 'bed-bug-treatment',
    title: 'Bed bug treatment in Dubai, Sharjah and Ajman',
    lead: 'Two visits, 14 days apart, so the bugs that hatch after the first visit are treated too. Mattresses, frames, sofas and curtains.',
    signs: ['Itchy bites in lines or small groups, usually in the morning', 'Small rust or dark spots on sheets and mattress seams', 'Tiny pale eggs or shed skins in mattress folds', 'Live bugs in bed frames, headboards or sofa seams'],
    causes: ['Luggage after travel or a hotel stay', 'Second-hand furniture and mattresses', 'Neighbouring apartments, through wall gaps and sockets', 'Visitors bags and clothes'],
    prevention: ['Check hotel beds and keep luggage off the floor when travelling', 'Wash travel clothes on a hot cycle when you get home', 'Inspect second-hand furniture before bringing it in', 'Vacuum mattress seams and bed frames regularly'],
    faq: [
      ['Why two visits?', 'Bed bug eggs are protected from most treatments. The second visit, 14 days later, treats the bugs that hatched after the first visit and breaks the cycle.'],
      ['Should I throw away my mattress?', 'Usually not. We treat mattresses, frames and furniture. We will tell you honestly if an item is too badly affected.'],
      ['How do I prepare?', 'Strip the beds and wash all bedding on a hot cycle before we arrive, and clear the area around the beds.'],
    ],
  },
  ants: {
    slug: 'ant-control',
    title: 'Ant control in Dubai, Sharjah and Ajman',
    lead: 'Gel baits and barrier spray that the ants carry back to the colony, so the nest is treated and not just the trail you can see.',
    signs: ['Lines of ants on counters, walls or the balcony', 'Ants around pet food, sugar or fruit', 'Small piles of soil or sand near skirting boards or tiles', 'Winged ants appearing indoors'],
    causes: ['Sweet food and crumbs left out', 'Water from plants, sinks and air-conditioning units', 'Gaps around windows, doors and pipes', 'Garden and balcony pots close to the walls'],
    prevention: ['Keep sweet food sealed and wipe spills straight away', 'Do not leave pet food out between meals', 'Seal gaps around pipes and window frames', 'Move plant pots slightly away from the walls'],
    faq: [
      ['Why do I still see ants after treatment?', 'Ants carry the bait back to the nest, so you may see more for a day or two. Do not wipe the bait away. The colony usually collapses within a week.'],
      ['Is it safe around children and pets?', 'Yes. Baits are placed where children and pets cannot reach them, and the technician explains where everything is.'],
      ['Do you treat balconies and gardens?', 'Yes. Apartment treatment includes the balcony; villa treatment includes the garden perimeter.'],
    ],
  },
  rodents: {
    slug: 'rodent-control',
    title: 'Rat and mouse control in Dubai, Sharjah and Ajman',
    lead: 'Tamper-proof bait stations and traps, with the entry points found and sealed so rats and mice cannot come back in.',
    signs: ['Droppings along walls, in cupboards or in the store room', 'Gnaw marks on food packets, wires or doors', 'Scratching noises in ceilings or walls at night', 'Holes or burrows near the garden wall or bins'],
    causes: ['Open bins and food waste outside', 'Gaps under doors and around pipes and cables', 'Gardens, drains and nearby construction', 'Clutter in store rooms and garages'],
    prevention: ['Use bins with tight lids and empty them daily', 'Fit door sweeps and seal gaps around pipes', 'Keep store rooms tidy and off the floor', 'Trim plants and climbers away from the walls'],
    faq: [
      ['Are the bait stations safe for children and pets?', 'Yes. We use locked, tamper-proof stations placed away from play areas, and we record where each one is.'],
      ['How long does it take?', 'Activity usually drops within 1 to 2 weeks. Sealing entry points is what keeps them out for good.'],
      ['Do you come back to check?', 'Yes. The technician agrees a follow-up check with you to inspect the stations.'],
    ],
  },
  termites: {
    slug: 'termite-control',
    title: 'Termite control in Dubai, Sharjah and Ajman',
    lead: 'A specialist inspects your property first, then gives you a fixed price for targeted treatment and barrier protection.',
    signs: ['Thin mud tubes on walls, foundations or door frames', 'Wood that sounds hollow when tapped', 'Doors and windows that suddenly stick', 'Small piles of wings near windows'],
    causes: ['Soil contact with wooden frames and floors', 'Moisture from irrigation, leaks or air-conditioning', 'Wooden furniture and storage against outside walls', 'Untreated soil around new villas and extensions'],
    prevention: ['Fix leaks and keep irrigation away from the walls', 'Keep wood and cardboard off the ground and away from walls', 'Ask for a termite inspection before buying or renting a villa', 'Have a yearly inspection if you have had termites before'],
    faq: [
      ['Why do you need to inspect first?', 'Termite work depends on the size of the property and where the colony is. The free survey lets us give you an exact price before any work starts.'],
      ['Is the survey really free?', 'Yes. Our operations team calls you to arrange a time that suits you.'],
      ['Do you treat new builds?', 'Yes. We can treat the soil before construction and protect existing villas with a barrier.'],
    ],
  },
  mosquitoes: {
    slug: 'mosquito-control',
    title: 'Mosquito control in Dubai, Sharjah and Ajman',
    lead: 'Fogging for gardens and balconies plus larvicide for standing water, so you deal with the mosquitoes and where they breed.',
    signs: ['Bites in the evening and early morning', 'Mosquitoes resting on shaded walls and under plants', 'Larvae in standing water, plant saucers or water features', 'More mosquitoes after rain or irrigation'],
    causes: ['Standing water in pots, trays, pools covers and drains', 'Over-watered gardens and blocked gullies', 'Dense, shaded planting near doors and windows', 'Water features without circulation'],
    prevention: ['Empty plant saucers and buckets every few days', 'Keep gullies and drains clear', 'Cover water tanks and change pet water daily', 'Use screens on windows and doors'],
    faq: [
      ['Is fogging safe for my family and pets?', 'We use municipality-approved products. Keep children and pets indoors during fogging and for about 30 minutes after.'],
      ['How long does it last?', 'Fogging gives quick relief. Treating breeding sites with larvicide is what keeps numbers down, and regular visits work best in warm months.'],
      ['Do you treat apartments?', 'Yes. We treat balconies, terraces and any standing water around the apartment.'],
    ],
  },
  flies: {
    slug: 'fly-control',
    title: 'Fly control in Dubai, Sharjah and Ajman',
    lead: 'Baits, traps and residual spray around kitchens and bin areas, with fly light traps for restaurants and food businesses.',
    signs: ['Flies around bins, drains and the kitchen', 'Small flies near fruit or sink drains', 'Fly spots on walls and light fittings', 'Maggots in bins or around waste'],
    causes: ['Bins without lids or emptied too rarely', 'Food waste and spills', 'Blocked or dirty drains', 'Open doors and windows near waste areas'],
    prevention: ['Use bins with lids and empty them daily', 'Clean drains and bin areas weekly', 'Keep fruit covered or in the fridge', 'Fit screens on kitchen windows and doors'],
    faq: [
      ['Do you install fly light traps?', 'Yes, for restaurants, kitchens and food businesses. We also service and replace the glue boards.'],
      ['Will the spray affect food areas?', 'No. Food areas are covered or treated with food-safe methods, and the technician tells you when surfaces can be used.'],
      ['How quickly will it work?', 'Most customers see a clear drop within a few days, as long as the source of the flies is cleaned up.'],
    ],
  },
  amc: {
    slug: 'commercial-pest-control',
    title: 'Commercial pest control and annual contracts',
    lead: 'Scheduled visits, service reports for your inspections and call-outs included, for restaurants, offices, buildings and warehouses.',
    signs: ['You need records for food safety or municipality inspections', 'Pests seen by staff, guests or tenants', 'Deliveries and waste areas attracting pests', 'Several sites that need one provider'],
    causes: ['Food preparation and storage areas', 'Busy loading bays and bin rooms', 'Shared service ducts in buildings', 'Gaps in maintenance between visits'],
    prevention: ['Regular scheduled visits instead of one-off call-outs', 'Clear records after every visit', 'Staff told what to report and how', 'Quick call-outs between scheduled visits'],
    faq: [
      ['What is included in an annual contract?', 'Scheduled visits, inspection and treatment, a service report after each visit and call-outs between visits. The exact plan is agreed after the site inspection.'],
      ['Do you provide reports for inspections?', 'Yes. You receive a service report after every visit to keep on file.'],
      ['Can you cover several sites?', 'Yes. We can set up one contract for all your locations in Dubai, Sharjah and Ajman.'],
    ],
  },
};

module.exports = { SERVICES };
