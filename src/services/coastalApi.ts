import {
  TidesData,
  UVData,
  HeatStressData,
  WindDataGovResponse,
  LiveStreamStatus
} from '../types/index.ts';

const REQUEST_TIMEOUT_MS = 8000;

async function fetchStream<T>(
  endpoint: string,
  sourceName: string
): Promise<{ data: T | null; status: LiveStreamStatus }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const now = new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 503) {
        return {
          data: null,
          status: {
            source: sourceName,
            endpoint,
            state: 'refused',
            plainMessage: 'Service key not configured (HTTP 503). Provider call halted.',
            timestamp: now
          }
        };
      }

      return {
        data: null,
        status: {
          source: sourceName,
          endpoint,
          state: 'refused',
          plainMessage: `Connection refused or unavailable from ${sourceName} (HTTP ${res.status}).`,
          timestamp: now
        }
      };
    }

    const json = await res.json();

    // Check if data is empty
    if (!json || (Array.isArray(json) && json.length === 0) || (typeof json === 'object' && Object.keys(json).length === 0)) {
      return {
        data: null,
        status: {
          source: sourceName,
          endpoint,
          state: 'empty',
          plainMessage: `The feed from ${sourceName} returned empty data for this period.`,
          timestamp: now
        }
      };
    }

    // Specific empty checks
    if (endpoint.includes('tides') && (!json.today || json.today.length === 0)) {
      return {
        data: json,
        status: {
          source: sourceName,
          endpoint,
          state: 'empty',
          plainMessage: 'No tidal readings available for Singapore coastal waters today.',
          timestamp: now
        }
      };
    }

    return {
      data: json,
      status: {
        source: sourceName,
        endpoint,
        state: 'live',
        plainMessage: `Live stream operational from ${sourceName}.`,
        timestamp: now
      }
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        data: null,
        status: {
          source: sourceName,
          endpoint,
          state: 'slow',
          plainMessage: `Data from ${sourceName} was too slow to respond (timeout after 8s).`,
          timestamp: now
        }
      };
    }

    return {
      data: null,
      status: {
        source: sourceName,
        endpoint,
        state: 'refused',
        plainMessage: `Network connection failed or refused when reaching ${endpoint}.`,
        timestamp: now
      }
    };
  }
}

export async function fetchAllCoastalData() {
  const [tidesRes, uvRes, heatStressRes, windDirRes, windSpeedRes] = await Promise.all([
    fetchStream<TidesData>('/api/tides', 'NEA Coastal Tides'),
    fetchStream<UVData>('/api/uv', 'NEA UV Index'),
    fetchStream<HeatStressData>('/api/heat-stress', 'NEA Heat Stress WBGT'),
    fetchStream<WindDataGovResponse>('/api/wind-direction', 'Data.gov.sg Wind Direction'),
    fetchStream<WindDataGovResponse>('/api/wind-speed', 'Data.gov.sg Wind Speed')
  ]);

  return {
    tides: tidesRes.data,
    uv: uvRes.data,
    heatStress: heatStressRes.data,
    windDirection: windDirRes.data,
    windSpeed: windSpeedRes.data,
    statuses: {
      tides: tidesRes.status,
      uv: uvRes.status,
      heatStress: heatStressRes.status,
      windDirection: windDirRes.status,
      windSpeed: windSpeedRes.status
    }
  };
}
