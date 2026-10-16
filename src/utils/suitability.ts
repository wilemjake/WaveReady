import {
  BeachSpot,
  TidesData,
  UVData,
  HeatStressData,
  WindDataGovResponse,
  RainForecastData,
  RainForecastDay,
  SuitabilityBreakdown,
  ActivitySuitability,
  SportType
} from '../types/index.ts';

function degreesToCompass(deg: number | null): string {
  if (deg === null || isNaN(deg)) return 'Variable';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || 'Variable';
}

function extractWindReading(
  windResponse: WindDataGovResponse | null,
  stationId: string
): number | null {
  if (!windResponse) return null;

  if (windResponse.data?.readings && windResponse.data.readings.length > 0) {
    const latestBatch = windResponse.data.readings[0].data;
    const match = latestBatch.find(
      (r) => r.stationId.toUpperCase() === stationId.toUpperCase()
    );
    if (match && typeof match.value === 'number') {
      return match.value;
    }
    if (latestBatch.length > 0 && typeof latestBatch[0].value === 'number') {
      return latestBatch[0].value;
    }
  }

  if (windResponse.items && windResponse.items.length > 0) {
    const latestBatch = windResponse.items[0].readings;
    const match = latestBatch.find(
      (r) => r.station_id.toUpperCase() === stationId.toUpperCase()
    );
    if (match && typeof match.value === 'number') {
      return match.value;
    }
    if (latestBatch.length > 0 && typeof latestBatch[0].value === 'number') {
      return latestBatch[0].value;
    }
  }

  return null;
}

export function computeBeachSuitability(
  beach: BeachSpot,
  tidesData: TidesData | null,
  uvData: UVData | null,
  heatStressData: HeatStressData | null,
  windSpeedData: WindDataGovResponse | null,
  windDirData: WindDataGovResponse | null,
  rainData: RainForecastData | null = null,
  activeSport: SportType = 'all'
): SuitabilityBreakdown {
  // 1. Wind speed & direction
  const rawWindSpeedKnots = extractWindReading(windSpeedData, beach.closestWindStationId);
  const windSpeedKnots = rawWindSpeedKnots !== null ? rawWindSpeedKnots : 7;
  const windSpeedKmh = Math.round(windSpeedKnots * 1.852 * 10) / 10;

  const rawWindDirDeg = extractWindReading(windDirData, beach.closestWindStationId);
  const windCompass = degreesToCompass(rawWindDirDeg);

  // 2. Tides
  let tideHeightM: number | null = null;
  let tideType = 'Rising';
  let nextTideInfo = 'Tide cycle live';

  if (tidesData?.today && tidesData.today.length > 0) {
    const readings = tidesData.today;
    const nowTime = new Date();
    const currentHourMin = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;

    const upcoming = readings.find((t) => t.tide_time >= currentHourMin);
    const prev = [...readings].reverse().find((t) => t.tide_time <= currentHourMin) || readings[0];

    if (upcoming) {
      nextTideInfo = `Next: ${upcoming.tide_type.toUpperCase()} tide of ${upcoming.height_metres}m at ${upcoming.tide_time.slice(0, 5)}`;
      tideType = upcoming.tide_type === 'high' ? 'Flooding (Rising)' : 'Ebbing (Falling)';
      tideHeightM = parseFloat(prev.height_metres);
    } else {
      const last = readings[readings.length - 1];
      nextTideInfo = `Last recorded: ${last.tide_type.toUpperCase()} ${last.height_metres}m at ${last.tide_time.slice(0, 5)}`;
      tideHeightM = parseFloat(last.height_metres);
      tideType = last.tide_type;
    }
  }

  // 3. UV & Heat Stress
  const uvIndex = uvData?.current?.uv_value ?? 4;
  const uvBand = uvData?.current?.category ?? 'Moderate';

  const wbgtRaw = heatStressData?.current?.wbgt_value ? parseFloat(heatStressData.current.wbgt_value) : 31.5;
  const wbgtCelsius = Math.round(wbgtRaw * 10) / 10;
  const heatCategory = heatStressData?.current?.category ?? 'Moderate';

  // 4. Rain Forecast telemetry
  const rainForecastToday: RainForecastDay | null = rainData?.forecasts?.[0] ?? null;
  let rainRiskLevel: 'Low' | 'Moderate' | 'High' | 'Heavy Thunderstorms' = 'Low';
  let rainScorePenalty = 0;

  if (rainForecastToday) {
    const desc = (rainForecastToday.forecast + ' ' + (rainForecastToday.forecast_summary || '')).toLowerCase();
    if (desc.includes('thundery') || desc.includes('thunderstorm')) {
      rainRiskLevel = 'Heavy Thunderstorms';
      rainScorePenalty = 8;
    } else if (desc.includes('heavy shower') || desc.includes('heavy rain')) {
      rainRiskLevel = 'High';
      rainScorePenalty = 6;
    } else if (desc.includes('shower') || desc.includes('rain')) {
      rainRiskLevel = 'Moderate';
      rainScorePenalty = 3;
    }
  }

  const warnings: string[] = [];

  if (rainRiskLevel === 'Heavy Thunderstorms') {
    warnings.push(`NEA Alert: ${rainForecastToday?.forecast || 'Thundery Showers'} forecasted. Lightning risk in open water.`);
  }
  if (wbgtCelsius >= 32.5) {
    warnings.push(`High Heat Stress (WBGT ${wbgtCelsius}°C): Hydrate regularly and seek shaded rest between sessions.`);
  }
  if (windSpeedKmh >= 25) {
    warnings.push(`Choppy Coastal Wind (${windSpeedKmh} km/h ${windCompass}): Elevated swell on exposed shorelines.`);
  }

  // 5. WIDENED WAVE SCORE ALGORITHM TAILORED FOR SWIMMING, KAYAK, FISHING BOAT
  // Real Singapore coastal physics:
  // - Sheltered lagoons (Sentosa) excel at swimming and paddleboarding, but poor for motorized boats.
  // - Deep offshore bays (Southern Islands) excel at fishing boats and yachts, but have strong channel currents.
  // - Estuarine mangrove flats (Pasir Ris) excel at kayaking, but ground fishing boat props (< 0.8m).
  // - Shipping channels & commercial piers (West Coast/Marina South) are hazardous/illegal for swimmers (score < 30).

  // A. SWIMMING WAVE SCORE
  let swimmingScore = 80;
  let swimmingAdvice = '';
  if (!beach.swimmingPermitted) {
    swimmingScore = 24;
    swimmingAdvice = 'Strictly prohibited: Commercial port channel with heavy ship propeller hazards.';
  } else if (beach.coastalEnvironment === 'sheltered_lagoon') {
    swimmingScore = 94 - (windSpeedKmh > 18 ? 4 : 0) - rainScorePenalty;
    swimmingAdvice = 'Prime glassy conditions: Wave-break barrier keeps lagoon crystal calm and safe.';
  } else if (beach.coastalEnvironment === 'deep_offshore_bay') {
    swimmingScore = 76 - (windSpeedKmh > 16 ? 6 : 0) - rainScorePenalty;
    swimmingAdvice = 'Favorable sheltered bay; beware of deeper drop-offs outside marked buoys.';
  } else if (beach.coastalEnvironment === 'open_strait') {
    if (beach.id.includes('changi')) {
      swimmingScore = 48 - (windSpeedKmh > 14 ? 8 : 0) - rainScorePenalty;
      swimmingAdvice = 'Challenging: Swift Johor Strait rip currents and coastal vessel fairway nearby.';
    } else {
      swimmingScore = 62 - (windSpeedKmh > 16 ? 8 : 0) - rainScorePenalty;
      swimmingAdvice = 'Moderate: Shorebreak and longshore current present. Swim within lifeguard flags.';
    }
  } else if (beach.coastalEnvironment === 'shallow_mangrove_flats') {
    swimmingScore = 54 - (tideHeightM && tideHeightM < 1.2 ? 14 : 0) - rainScorePenalty;
    swimmingAdvice = 'Fair: Very shallow muddy tidal flats; limited clean swimming depth at low water.';
  }
  swimmingScore = Math.max(15, Math.min(98, Math.round(swimmingScore)));

  // B. KAYAK & SUP WAVE SCORE
  let kayakScore = 78;
  let kayakAdvice = '';
  if (beach.coastalEnvironment === 'shallow_mangrove_flats') {
    kayakScore = 93 - (windSpeedKmh > 14 ? 5 : 0) - (rainScorePenalty > 4 ? 4 : 0);
    kayakAdvice = 'Optimal: Glassy flat water and scenic mangrove creeks with zero ocean swell.';
  } else if (beach.coastalEnvironment === 'sheltered_lagoon') {
    kayakScore = 89 - (windSpeedKmh > 16 ? 6 : 0) - rainScorePenalty;
    kayakAdvice = 'Prime protected lagoon: Gentle paddle tracks ideal for recreation and beginner SUP.';
  } else if (beach.coastalEnvironment === 'open_strait') {
    if (beach.id.includes('changi')) {
      kayakScore = 72 - (windSpeedKmh > 18 ? 10 : 0) - rainScorePenalty;
      kayakAdvice = 'Good for experienced paddlers touring Pulau Ubin; watch cross-current drift.';
    } else {
      kayakScore = 58 - (windSpeedKmh > 16 ? 12 : 0) - rainScorePenalty;
      kayakAdvice = 'Moderate: Open strait crosswinds push paddlers downwind; stay close to shore.';
    }
  } else if (beach.coastalEnvironment === 'deep_offshore_bay') {
    kayakScore = 66 - (windSpeedKmh > 16 ? 10 : 0) - rainScorePenalty;
    kayakAdvice = 'Favorable inside bay; hazardous crossing main shipping fairway to mainland.';
  } else if (beach.coastalEnvironment === 'shipping_channel' || beach.coastalEnvironment === 'urban_basin') {
    kayakScore = 38 - rainScorePenalty;
    kayakAdvice = 'Caution: High vessel wake chop and heavy maritime traffic; launch permit required.';
  }
  kayakScore = Math.max(20, Math.min(97, Math.round(kayakScore)));

  // C. FISHING BOAT & CHARTER WAVE SCORE
  let fishingBoatScore = 75;
  let fishingBoatAdvice = '';
  if (beach.coastalEnvironment === 'deep_offshore_bay') {
    fishingBoatScore = 96 - (windSpeedKmh > 26 ? 10 : 0) - (rainScorePenalty > 5 ? 5 : 0);
    fishingBoatAdvice = 'World-class: Deep 15-30m drop-offs, moving current, and prime pelagic game fishing.';
  } else if (beach.coastalEnvironment === 'shipping_channel') {
    fishingBoatScore = 90 - (windSpeedKmh > 24 ? 8 : 0) - (rainScorePenalty > 5 ? 5 : 0);
    fishingBoatAdvice = 'Prime offshore charter: Deep navigation draft and immediate transit to Sultan Shoal.';
  } else if (beach.id.includes('changi')) {
    fishingBoatScore = 85 - (windSpeedKmh > 22 ? 8 : 0) - (rainScorePenalty > 5 ? 5 : 0);
    fishingBoatAdvice = 'Excellent tidal flow: Live bait drift fishing along eastern shelf and Johor channel.';
  } else if (beach.coastalEnvironment === 'urban_basin') {
    fishingBoatScore = 82 - (windSpeedKmh > 24 ? 8 : 0) - (rainScorePenalty > 5 ? 5 : 0);
    fishingBoatAdvice = 'High-convenience charter departure: Direct access to Marina South Pier berths.';
  } else if (beach.coastalEnvironment === 'open_strait') {
    fishingBoatScore = 68 - (windSpeedKmh > 24 ? 12 : 0) - rainScorePenalty;
    fishingBoatAdvice = 'Moderate: Shallow coastal shelf requires running 2-3 nautical miles offshore.';
  } else if (beach.coastalEnvironment === 'sheltered_lagoon') {
    fishingBoatScore = 50 - (tideHeightM && tideHeightM < 1.4 ? 10 : 0) - rainScorePenalty;
    fishingBoatAdvice = 'Challenging: Motorized craft restricted inside lagoons; pick up at marina fairway only.';
  } else if (beach.coastalEnvironment === 'shallow_mangrove_flats') {
    fishingBoatScore = 34 - (tideHeightM && tideHeightM < 1.5 ? 12 : 0) - rainScorePenalty;
    fishingBoatAdvice = 'Poor: Shallow estuarine flats; severe propeller grounding risk at low tide (<1.0m).';
  }
  fishingBoatScore = Math.max(20, Math.min(98, Math.round(fishingBoatScore)));

  // D. ALL SPORTS COMPOSITE WAVE SCORE
  const allScore = Math.round((swimmingScore + kayakScore + fishingBoatScore) / 3);
  const allAdvice = `${windSpeedKmh} km/h ${windCompass} breeze · ${tideHeightM ? `${tideHeightM}m tide` : 'Active tides'} · ${rainForecastToday?.forecast || 'Rain radar clear'}`;

  // Select active tailored Wave Score based on activeSport parameter
  let waveScore = allScore;
  if (activeSport === 'swimming') waveScore = swimmingScore;
  else if (activeSport === 'kayak') waveScore = kayakScore;
  else if (activeSport === 'fishing_boat') waveScore = fishingBoatScore;

  // Grade rating based on active wave score
  let rating: 'Prime' | 'Good' | 'Moderate' | 'Caution' = 'Good';
  if (waveScore >= 85) rating = 'Prime';
  else if (waveScore >= 70) rating = 'Good';
  else if (waveScore >= 50) rating = 'Moderate';
  else rating = 'Caution';

  // Activity breakdown for modals & details
  const activities: Record<string, ActivitySuitability> = {
    'Swimming': {
      score: swimmingScore,
      suitability: swimmingScore >= 80 ? 'Optimal' : swimmingScore >= 60 ? 'Favorable' : swimmingScore >= 40 ? 'Challenging' : 'Prohibited',
      advice: swimmingAdvice
    },
    'Kayaking & SUP': {
      score: kayakScore,
      suitability: kayakScore >= 80 ? 'Optimal' : kayakScore >= 60 ? 'Favorable' : kayakScore >= 40 ? 'Challenging' : 'Hazardous',
      advice: kayakAdvice
    },
    'Fishing Charter': {
      score: fishingBoatScore,
      suitability: fishingBoatScore >= 80 ? 'Optimal' : fishingBoatScore >= 65 ? 'Favorable' : fishingBoatScore >= 45 ? 'Challenging' : 'Hazardous',
      advice: fishingBoatAdvice
    },
    'Jetski & Wake': {
      score: beach.coastalEnvironment === 'sheltered_lagoon' || beach.coastalEnvironment === 'deep_offshore_bay' ? 88 : 62,
      suitability: 'Favorable',
      advice: 'Fast water sectors outside marked swimming buoys.'
    },
    'Yachting & Sailing': {
      score: beach.boatDraftClearance === 'deep' ? 92 : beach.boatDraftClearance === 'medium' ? 78 : 42,
      suitability: beach.boatDraftClearance === 'deep' ? 'Optimal' : 'Favorable',
      advice: `Draft clearance: ${beach.boatDraftClearance.toUpperCase()} water navigation.`
    }
  };

  const conditionSummary = `${windSpeedKmh} km/h ${windCompass} · ${tideHeightM ? `${tideHeightM}m tide` : 'Tide active'} · ${rainForecastToday?.forecast || 'Rain radar clear'}`;

  return {
    waveScore,
    rating,
    conditionSummary,
    sportWaveScores: {
      swimming: swimmingScore,
      kayak: kayakScore,
      fishing_boat: fishingBoatScore,
      all: allScore
    },
    sportAdvice: {
      swimming: swimmingAdvice,
      kayak: kayakAdvice,
      fishing_boat: fishingBoatAdvice,
      all: allAdvice
    },
    activities,
    windSpeedKmh,
    windSpeedKnots,
    windDirectionDeg: rawWindDirDeg,
    windCompass,
    tideHeightM,
    tideType,
    nextTideInfo,
    uvIndex,
    uvBand,
    wbgtCelsius,
    heatCategory,
    rainForecastToday,
    rainRiskLevel,
    warnings
  };
}
