/**
 * Serverless function for NEA and Data.gov.sg Coastal Weather & Tides API
 * Compatible with Vercel Serverless Functions and Express backend
 */

interface FetchOptions {
  timeoutMs?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const timeoutMs = options.timeoutMs || 8000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WaveReady-CoastalWeather/1.0'
      }
    });
    clearTimeout(id);
    return res;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out after 8 seconds. The remote service is slow to respond.');
    }
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Guardrail 4: If a key variable is configured in env but empty, return 503 "key not configured"
  // Note: There is no key required for this service (Guardrail 6), but we enforce Guardrail 4 if set
  if (
    (typeof process.env.NEA_API_KEY !== 'undefined' && process.env.NEA_API_KEY.trim() === '') ||
    (typeof process.env.DATA_GOV_SG_API_KEY !== 'undefined' && process.env.DATA_GOV_SG_API_KEY.trim() === '')
  ) {
    return res.status(503).json({
      error: 'key not configured',
      message: 'The required service key is defined but empty.'
    });
  }

  // Determine requested endpoint from query param or request path
  const urlPath = req.url ? req.url.split('?')[0] : '';
  const queryEndpoint = req.query?.endpoint || '';
  let endpoint = queryEndpoint;

  if (!endpoint) {
    if (urlPath.includes('/tides')) endpoint = 'tides';
    else if (urlPath.includes('/uv')) endpoint = 'uv';
    else if (urlPath.includes('/heat-stress')) endpoint = 'heat-stress';
    else if (urlPath.includes('/wind-direction')) endpoint = 'wind-direction';
    else if (urlPath.includes('/wind-speed')) endpoint = 'wind-speed';
    else if (urlPath.includes('/rain')) endpoint = 'rain';
    else endpoint = 'overview';
  }

  try {
    switch (endpoint) {
      case 'rain': {
        // 4-day rain and weather forecast from NEA: https://neaweather.com/api/v1/forecast/4day
        const targetUrl = 'https://neaweather.com/api/v1/forecast/4day';
        const response = await fetchWithTimeout(targetUrl);
        if (!response.ok) {
          return res.status(response.status).json({
            error: `NEA 4-Day Rain Forecast service returned HTTP ${response.status}`,
            endpoint: '/api/rain',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      case 'tides': {
        const targetUrl = 'https://neaweather.com/api/v1/tides';
        const response = await fetchWithTimeout(targetUrl);
        if (!response.ok) {
          return res.status(response.status).json({
            error: `NEA Tides service returned HTTP ${response.status}`,
            endpoint: '/api/tides',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      case 'uv': {
        const targetUrl = 'https://neaweather.com/api/v1/uv';
        const response = await fetchWithTimeout(targetUrl);
        if (!response.ok) {
          return res.status(response.status).json({
            error: `NEA UV service returned HTTP ${response.status}`,
            endpoint: '/api/uv',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      case 'heat-stress': {
        // Primary requested endpoint: https://neaweather.com/api/heat-stress
        let targetUrl = 'https://neaweather.com/api/heat-stress';
        let response = await fetchWithTimeout(targetUrl).catch(() => null);

        // Fallback to https://neaweather.com/api/v1/heat-stress if primary 404s
        if (!response || !response.ok) {
          targetUrl = 'https://neaweather.com/api/v1/heat-stress';
          response = await fetchWithTimeout(targetUrl);
        }

        if (!response || !response.ok) {
          return res.status(response ? response.status : 502).json({
            error: 'NEA Heat Stress service is currently unavailable or refused connection',
            endpoint: '/api/heat-stress',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      case 'wind-direction': {
        // Wind direction dataset: https://data.gov.sg/datasets/d_534cf203023b51f51f879145ccc56ff9/view
        let response = await fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-direction').catch(() => null);
        if (!response || !response.ok) {
          response = await fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-direction');
        }

        if (!response || !response.ok) {
          return res.status(response ? response.status : 502).json({
            error: 'Data.gov.sg Wind Direction service is currently unavailable',
            endpoint: '/api/wind-direction',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      case 'wind-speed': {
        // Wind speed dataset: https://data.gov.sg/datasets/d_7677738484067741bf3b56ab5d69c7e9/view
        let response = await fetchWithTimeout('https://api-open.data.gov.sg/v2/real-time/api/wind-speed').catch(() => null);
        if (!response || !response.ok) {
          response = await fetchWithTimeout('https://api.data.gov.sg/v1/environment/wind-speed');
        }

        if (!response || !response.ok) {
          return res.status(response ? response.status : 502).json({
            error: 'Data.gov.sg Wind Speed service is currently unavailable',
            endpoint: '/api/wind-speed',
            data: null
          });
        }
        const data = await response.json();
        return res.status(200).json(data);
      }

      default: {
        return res.status(200).json({
          message: 'WaveReady NEA and Data.gov.sg Coastal Weather Gateway',
          available_endpoints: [
            '/api/tides',
            '/api/uv',
            '/api/heat-stress',
            '/api/wind-direction',
            '/api/wind-speed',
            '/api/rain'
          ]
        });
      }
    }
  } catch (error: any) {
    return res.status(502).json({
      error: error.message || 'Service communication error',
      endpoint: `/api/${endpoint}`,
      data: null
    });
  }
}
