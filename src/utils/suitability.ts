import {
  BeachSpot,
  TidesData,
  UVData,
  HeatStressData,
  WindDataGovResponse,
  SuitabilityBreakdown,
  ActivitySuitability
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

  // Format 1: data.readings[0].data
  if (windResponse.data?.readings && windResponse.data.readings.length > 0) {
    const latestBatch = windResponse.data.readings[0].data;
    const match = latestBatch.find(
      (r) => r.stationId.toUpperCase() === stationId.toUpperCase()
    );
    if (match && typeof match.value === 'number') {
      return match.value;
    }
    // Fallback to first available reading
    if (latestBatch.length > 0 && typeof latestBatch[0].value === 'number') {
      return latestBatch[0].value;
    }
  }

  // Format 2: items[0].readings
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
  windDirData: WindDataGovResponse | null
): SuitabilityBreakdown {
  // 1. Wind speed & direction
  const rawWindSpeedKnots = extractWindReading(windSpeedData, beach.closestWindStationId);
  const windSpeedKnots = rawWindSpeedKnots !== null ? rawWindSpeedKnots : 7; // default calm coastal baseline if station sensor offline
  const windSpeedKmh = Math.round(windSpeedKnots * 1.852 * 10) / 10;

  const rawWindDirDeg = extractWindReading(windDirData, beach.closestWindStationId);
  const windCompass = degreesToCompass(rawWindDirDeg);

  // 2. Tides
  let tideHeightM: number | null = null;
  let tideType = 'Rising';
  let nextTideInfo = 'Tide data pending';

  if (tidesData?.today && tidesData.today.length > 0) {
    const readings = tidesData.today;
    const nowTime = new Date();
    const currentHourMin = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;

    // Find next upcoming tide
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

  // 4. Activity Suitability Scoring
  const activities: Record<string, ActivitySuitability> = {};
  const warnings: string[] = [];

  if (wbgtCelsius >= 32.5) {
    warnings.push(`High Heat Stress (WBGT ${wbgtCelsius}°C): Limit continuous high-exertion activity and maintain heavy hydration.`);
  }
  if (uvIndex >= 8) {
    warnings.push(`Intense UV Radiation (Index ${uvIndex}): Full marine sunblock, rashguards and UV-rated sunglasses required.`);
  }
  if (windSpeedKmh >= 28) {
    warnings.push(`Elevated Offshore Wind (${windSpeedKmh} km/h): Moderate sea chop expected outside sheltered inner bays.`);
  }

  // Activity: Fishing Charter
  {
    let score = 85;
    // Moving water is prime for predatory fish
    if (tideHeightM && tideHeightM >= 2.0) score += 8;
    if (windSpeedKmh >= 10 && windSpeedKmh <= 20) score += 5;
    else if (windSpeedKmh > 26) score -= 18;

    score = Math.min(98, Math.max(40, score));
    activities['Fishing Charter'] = {
      score,
      suitability: score >= 80 ? 'Optimal' : score >= 65 ? 'Favorable' : 'Challenging',
      advice: score >= 80
        ? 'Prime tidal movement for pelagic predatory fish & reef drift fishing.'
        : 'Fish closer to protected breakwaters; watch drift speed in open channel.'
    };
  }

  // Activity: Jetski & Wake
  {
    let score = 82;
    if (windSpeedKmh <= 15) score += 10;
    else if (windSpeedKmh > 22) score -= 20;

    if (tideHeightM && tideHeightM < 1.2) score -= 15; // Shallow reef caution

    score = Math.min(96, Math.max(35, score));
    activities['Jetski & Wake'] = {
      score,
      suitability: score >= 80 ? 'Optimal' : score >= 60 ? 'Favorable' : 'Challenging',
      advice: score >= 80
        ? 'Glassy coastal water with excellent visibility for high-speed runs.'
        : 'Surface wind chop present; reduce throttle outside lagoon barriers.'
    };
  }

  // Activity: Yachting & Sailing
  {
    let score = 80;
    if (windSpeedKmh >= 12 && windSpeedKmh <= 26) score += 14;
    else if (windSpeedKmh < 8) score -= 10; // light air

    score = Math.min(95, Math.max(45, score));
    activities['Yachting & Sailing'] = {
      score,
      suitability: score >= 80 ? 'Optimal' : score >= 65 ? 'Favorable' : 'Challenging',
      advice: score >= 80
        ? `Clean ${windCompass} breeze of ${windSpeedKmh} km/h (${windSpeedKnots} kts) providing dependable propulsion.`
        : 'Gentle breezes; ideal for leisure motoryacht cruising and anchorages.'
    };
  }

  // Activity: Kayaking & SUP
  {
    let score = 86;
    if (windSpeedKmh <= 12) score += 8;
    else if (windSpeedKmh > 18) score -= 25;

    score = Math.min(97, Math.max(30, score));
    activities['Kayaking & SUP'] = {
      score,
      suitability: score >= 80 ? 'Optimal' : score >= 60 ? 'Favorable' : 'Hazardous',
      advice: score >= 80
        ? 'Gentle conditions along the coastline; easy launch and return.'
        : 'Crosswind drift detected; beginner paddlers should stay near shoreline.'
    };
  }

  // Activity: Swimming
  {
    let score = 84;
    if (wbgtCelsius > 33) score -= 12;
    if (windSpeedKmh > 24) score -= 15;

    score = Math.min(95, Math.max(30, score));
    activities['Swimming'] = {
      score,
      suitability: score >= 80 ? 'Optimal' : score >= 65 ? 'Favorable' : 'Challenging',
      advice: score >= 80
        ? 'Clean, calm waters within marked swimming zones.'
        : 'Swim in designated patrolled lagoon zones only.'
    };
  }

  // Overall Score
  const scores = Object.values(activities).map((a) => a.score);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  let rating: 'Prime' | 'Good' | 'Moderate' | 'Caution' = 'Good';
  if (overallScore >= 85) rating = 'Prime';
  else if (overallScore >= 72) rating = 'Good';
  else if (overallScore >= 55) rating = 'Moderate';
  else rating = 'Caution';

  const conditionSummary = `${windSpeedKmh} km/h ${windCompass} breeze · ${tideHeightM ? `${tideHeightM}m tide` : 'Tidal cycle active'} · WBGT ${wbgtCelsius}°C`;

  return {
    overallScore,
    rating,
    conditionSummary,
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
    warnings
  };
}
