import { BeachSpot } from '../types/index.ts';

export const SINGAPORE_BEACHES: BeachSpot[] = [
  {
    id: 'sentosa-tanjong-siloso',
    name: 'Sentosa (Siloso & Tanjong Beach)',
    zone: 'South Coast',
    shortDesc: 'Singapore premier leisure coast with sheltered lagoons, yacht fairways, and dedicated jetski sectors.',
    lat: 1.2494,
    lng: 103.8290,
    closestWindStationId: 'S60',
    activities: ['Jetski & Wake', 'Yachting & Sailing', 'Kayaking & SUP', 'Swimming'],
    idealTideLevel: 'high',
    highlights: ['Sheltered inner bay', 'Direct access to ONE°15 Marina', 'Calm sea conditions for paddleboards'],
    partnerIds: ['p-sentosa-jetski', 'p-one15-yachts']
  },
  {
    id: 'east-coast-park',
    name: 'East Coast Park (Parkland Green & Area F)',
    zone: 'East Coast',
    shortDesc: '15km coastal stretch ideal for open-water windsurfing, catamarans, and coastal shore fishing.',
    lat: 1.3032,
    lng: 103.9210,
    closestWindStationId: 'S107',
    activities: ['Yachting & Sailing', 'Fishing Charter', 'Kayaking & SUP', 'Swimming'],
    idealTideLevel: 'any',
    highlights: ['Steady sea breezes', 'Aloha Sea Sports Centre launch pad', 'Bedok Jetty fishing vantage'],
    partnerIds: ['p-aloha-seasports', 'p-eastcoast-anglers']
  },
  {
    id: 'southern-islands-lazarus',
    name: 'Southern Islands (Lazarus & St John’s)',
    zone: 'Offshore Islands',
    shortDesc: 'Deep-water horseshoe lagoon with pristine waters, prime yacht anchoring bays, and offshore fishing drops.',
    lat: 1.2222,
    lng: 103.8540,
    closestWindStationId: 'S108',
    activities: ['Fishing Charter', 'Yachting & Sailing', 'Swimming', 'Kayaking & SUP'],
    idealTideLevel: 'high',
    highlights: ['Crystal turquoise lagoon', 'Pelagic game fish drop-offs', 'Protected anchorages'],
    partnerIds: ['p-southern-islands-charters', 'p-one15-yachts']
  },
  {
    id: 'changi-beach-coast',
    name: 'Changi Beach & Coast Boardwalk',
    zone: 'East Coast',
    shortDesc: 'Natural sandy coastline facing Pulau Ubin and Johor Strait, revered by anglers and sea kayakers.',
    lat: 1.3912,
    lng: 103.9870,
    closestWindStationId: 'S106',
    activities: ['Fishing Charter', 'Kayaking & SUP', 'Swimming'],
    idealTideLevel: 'mid',
    highlights: ['Mangrove tidal flats', 'Morning pelagic migrations', 'Kayak access to Chek Jawa'],
    partnerIds: ['p-changi-offshore', 'p-constant-wind']
  },
  {
    id: 'pasir-ris-beach',
    name: 'Pasir Ris Beach & Coastal Park',
    zone: 'North-East',
    shortDesc: 'Tranquil coastal park featuring flat waters, mangrove river mouths, and beginner-friendly paddle tracks.',
    lat: 1.3785,
    lng: 103.9530,
    closestWindStationId: 'S106',
    activities: ['Kayaking & SUP', 'Fishing Charter', 'Swimming'],
    idealTideLevel: 'high',
    highlights: ['Ultra calm waters', 'Shaded coastline', 'Mangrove bird sanctuary exploration'],
    partnerIds: ['p-constant-wind', 'p-changi-offshore']
  },
  {
    id: 'west-coast-raffles-marina',
    name: 'West Coast & Raffles Marina',
    zone: 'West Coast',
    shortDesc: 'Western maritime corridor providing direct passage to Sultan Shoal and deep offshore game fishing.',
    lat: 1.2952,
    lng: 103.7660,
    closestWindStationId: 'S116',
    activities: ['Fishing Charter', 'Yachting & Sailing', 'Jetski & Wake'],
    idealTideLevel: 'any',
    highlights: ['Raffles Marina deep-draft berths', 'Tuas lighthouse views', 'Sunset yacht cruising corridor'],
    partnerIds: ['p-raffles-biggame', 'p-one15-yachts']
  },
  {
    id: 'marina-barrage-south',
    name: 'Marina South Coast & Outer Pier',
    zone: 'South Coast',
    shortDesc: 'Dynamic downtown maritime basin connecting city skyline waters with Southern Islands departure docks.',
    lat: 1.2799,
    lng: 103.8703,
    closestWindStationId: 'S108',
    activities: ['Yachting & Sailing', 'Fishing Charter', 'Kayaking & SUP'],
    idealTideLevel: 'any',
    highlights: ['Marina South Pier boat departures', 'Panoramic skyline backdrop', 'Harbor cruise routes'],
    partnerIds: ['p-southern-islands-charters', 'p-one15-yachts']
  }
];
