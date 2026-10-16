export default async function handler(req: any, res: any) {
  const timestamp = new Date().toISOString();
  return res.status(200).json({
    status: 'ok',
    service: 'WaveReady Serverless API',
    uptime: process.uptime ? process.uptime() : 0,
    timestamp,
    endpoints: [
      '/api/tides',
      '/api/uv',
      '/api/heat-stress',
      '/api/wind-direction',
      '/api/wind-speed',
      '/api/NEA'
    ]
  });
}
