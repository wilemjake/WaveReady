export interface TideItem {
  id?: number;
  date: string;
  tide_time: string;
  height_metres: string;
  tide_type: 'high' | 'low' | string;
}

export interface TidesData {
  today: TideItem[];
  tomorrow?: TideItem[];
}

export interface UVData {
  current?: {
    id?: number;
    uv_value: number;
    category: string;
    timestamp: string;
  };
  history?: Array<{
    date: string;
    reading_time: string;
    uv_value: number;
    band: string;
    color?: string;
  }>;
}

export interface HeatStressData {
  current?: {
    wbgt_value: string;
    category: string;
    timestamp: string;
  };
  history?: any[];
}

export interface WindStationItem {
  id: string;
  deviceId?: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface WindDataGovResponse {
  code?: number;
  data?: {
    stations?: WindStationItem[];
    readings?: Array<{
      timestamp: string;
      data: Array<{
        stationId: string;
        value: number;
      }>;
    }>;
  };
  metadata?: {
    stations?: Array<{
      id: string;
      device_id?: string;
      name: string;
      location: { latitude: number; longitude: number };
    }>;
    reading_type?: string;
    reading_unit?: string;
  };
  items?: Array<{
    timestamp: string;
    readings: Array<{
      station_id: string;
      value: number;
    }>;
  }>;
}

export interface BeachSpot {
  id: string;
  name: string;
  zone: 'South Coast' | 'East Coast' | 'North-East' | 'West Coast' | 'Offshore Islands';
  shortDesc: string;
  lat: number;
  lng: number;
  closestWindStationId: string;
  activities: Array<'Fishing Charter' | 'Jetski & Wake' | 'Yachting & Sailing' | 'Kayaking & SUP' | 'Swimming'>;
  idealTideLevel: 'high' | 'mid' | 'any';
  highlights: string[];
  partnerIds: string[];
  distanceKm?: number;
}

export interface PartnerVendor {
  id: string;
  name: string;
  category: 'Fishing Charter' | 'Boat & Yacht Rental' | 'Water Sports Equipment';
  hub: string;
  description: string;
  priceStartingFrom: string;
  rating: number;
  reviewsCount: number;
  image: string;
  fleetOrGear: string[];
  beachSpotIds: string[];
  contactPhone: string;
}

export interface LiveStreamStatus {
  source: string;
  endpoint: string;
  state: 'loading' | 'live' | 'empty' | 'slow' | 'refused';
  plainMessage: string;
  timestamp?: string;
}

export interface ActivitySuitability {
  score: number;
  suitability: 'Optimal' | 'Favorable' | 'Challenging' | 'Hazardous';
  advice: string;
}

export interface SuitabilityBreakdown {
  overallScore: number;
  rating: 'Prime' | 'Good' | 'Moderate' | 'Caution';
  conditionSummary: string;
  activities: Record<string, ActivitySuitability>;
  windSpeedKmh: number;
  windSpeedKnots: number;
  windDirectionDeg: number | null;
  windCompass: string;
  tideHeightM: number | null;
  tideType: string;
  nextTideInfo: string;
  uvIndex: number;
  uvBand: string;
  wbgtCelsius: number;
  heatCategory: string;
  warnings: string[];
}
