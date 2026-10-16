import { PartnerVendor } from '../types/index.ts';

export const PARTNER_VENDORS: PartnerVendor[] = [
  {
    id: 'p-southern-islands-charters',
    name: 'Southern Islands Sport Fishing Charters',
    category: 'Fishing Charter',
    hub: 'Marina South Pier & Lazarus Island',
    description: 'Premier deep-sea sportfishing aboard 38ft custom Bertram with dual Garmin sonars, fighting chair, live well, and IGFA gear for barramundi, queenfish, and trevally.',
    priceStartingFrom: '$650 / 4-hr charter',
    rating: 4.9,
    reviewsCount: 128,
    image: '/src/assets/images/partner_fishing_boat_1792134868482.jpg',
    fleetOrGear: [
      '38ft Bertram Tournament Sportfisher (Twin Cummins 450HP)',
      'Shimano Stella & Talica reels, live bait system',
      'Professional skipper & deckhand included',
      'Ice box, filleting service & complimentary cold drinks'
    ],
    beachSpotIds: ['southern-islands-lazarus', 'marina-barrage-south'],
    contactPhone: '+65 6789 2200'
  },
  {
    id: 'p-one15-yachts',
    name: 'ONE°15 Luxury Yacht Club Charters',
    category: 'Boat & Yacht Rental',
    hub: 'ONE°15 Marina, Sentosa Cove',
    description: 'Flagship catamaran and motoryacht fleet catering to executive charters, sunset cruises, and private water sport outings with jetski tenders and sea bobs.',
    priceStartingFrom: '$950 / 4-hr cruise',
    rating: 4.95,
    reviewsCount: 214,
    image: '/src/assets/images/hero_yacht_coastal_1792134867117.jpg',
    fleetOrGear: [
      '46ft Lagoon Sailing Catamaran & 55ft Azimut Yacht',
      'Full sun deck, air-conditioned saloon, sound system',
      'Included inflatable water mat, kayak, snorkel masks',
      'Optional SeaBob & Jet Ski add-on'
    ],
    beachSpotIds: ['sentosa-tanjong-siloso', 'southern-islands-lazarus', 'marina-barrage-south'],
    contactPhone: '+65 6305 6988'
  },
  {
    id: 'p-aloha-seasports',
    name: 'Aloha Sea Sports Centre',
    category: 'Water Sports Equipment',
    hub: 'East Coast Park (Area E2)',
    description: 'Singapore leading wind-driven water sports base providing top-tier hydrofoil equipment, windsurfers, stand-up paddleboards, and laser sailing dinghies.',
    priceStartingFrom: '$35 / hr rental',
    rating: 4.8,
    reviewsCount: 340,
    image: '/src/assets/images/partner_watersports_gear_1792134867070.jpg',
    fleetOrGear: [
      'Starboard & Fanatic carbon SUP boards with carbon paddles',
      'Severne windsurf rigs & Slingshot foil equipment',
      'Impact vests, certified lifejackets, and lockers',
      'On-site rescue safety craft standing by'
    ],
    beachSpotIds: ['east-coast-park'],
    contactPhone: '+65 6241 9212'
  },
  {
    id: 'p-sentosa-jetski',
    name: 'Sentosa Jet Ski & Hydro Sports',
    category: 'Boat & Yacht Rental',
    hub: 'Siloso Beach, Sentosa',
    description: 'High-octane personal watercraft rentals featuring 2026 Sea-Doo GTX 300hp units with licensed safety leads and designated offshore high-speed sectors.',
    priceStartingFrom: '$190 / 30-min run',
    rating: 4.85,
    reviewsCount: 96,
    image: '/src/assets/images/hero_yacht_coastal_1792134867117.jpg',
    fleetOrGear: [
      '2026 Sea-Doo GTX Limited 300 Supercharged',
      'Rotax engine with intelligent brake and reverse (iBR)',
      'Waterproof phone case & VHF radio comms provided',
      'Briefing and safety lead escort included'
    ],
    beachSpotIds: ['sentosa-tanjong-siloso'],
    contactPhone: '+65 6270 4120'
  },
  {
    id: 'p-changi-offshore',
    name: 'Changi Offshore Anglers & Boat Hire',
    category: 'Fishing Charter',
    hub: 'Changi Coastal Creek & Ferry Point',
    description: 'Tailored coastal fishing charters along the Johor Strait, Pulau Ubin mangroves, and eastern ship anchorages. Ideal for bottom fishing and drift jigging.',
    priceStartingFrom: '$480 / 5-hr session',
    rating: 4.75,
    reviewsCount: 88,
    image: '/src/assets/images/partner_fishing_boat_1792134868482.jpg',
    fleetOrGear: [
      '26ft Deep-V Center Console with Suzuki 200HP',
      'Live bait aerator well, rod holders, GPS fishfinder',
      'Target species: Snapper, Grouper, Threadfin, Barramundi',
      'Fresh live prawn bait supply available on order'
    ],
    beachSpotIds: ['changi-beach-coast', 'pasir-ris-beach'],
    contactPhone: '+65 6545 1190'
  },
  {
    id: 'p-constant-wind',
    name: 'Constant Wind Sea Sports & Sailing School',
    category: 'Water Sports Equipment',
    hub: 'NSRCC Sea Sports Centre, Changi Coast',
    description: 'Premier eastern nautical base providing ocean sea kayaking, Hobie catamarans, wing foiling, and open-water expedition gear rentals.',
    priceStartingFrom: '$40 / 2-hr hire',
    rating: 4.8,
    reviewsCount: 162,
    image: '/src/assets/images/partner_watersports_gear_1792134867070.jpg',
    fleetOrGear: [
      'Ocean Kayak single and double sit-on-top sea kayaks',
      'Hobie Wave & Getaway performance sailing catamarans',
      'Wing foiling rigs with inflatable wings and masts',
      'Hot shower facilities and equipment staging slipway'
    ],
    beachSpotIds: ['changi-beach-coast', 'pasir-ris-beach'],
    contactPhone: '+65 6445 5108'
  },
  {
    id: 'p-raffles-biggame',
    name: 'Raffles Marina Big Game Expeditions',
    category: 'Fishing Charter',
    hub: 'Raffles Marina, Tuas West',
    description: 'Long-range offshore fishing expeditions venturing past Sultan Shoal towards southern channel banks. High success rate for cobia, barracuda, and trevally.',
    priceStartingFrom: '$850 / 6-hr trip',
    rating: 4.9,
    reviewsCount: 74,
    image: '/src/assets/images/partner_fishing_boat_1792134868482.jpg',
    fleetOrGear: [
      '42ft Twin Yanmar Sportfisher with enclosed flybridge',
      'High-capacity Furuno CHIRP radar and sonar transducers',
      'Heavy offshore trolling rods with bent-butt gear',
      'Full galley, bunk berths and shower on board'
    ],
    beachSpotIds: ['west-coast-raffles-marina'],
    contactPhone: '+65 6861 8000'
  }
];
