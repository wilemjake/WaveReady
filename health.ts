// Root health check helper and export
export default async function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'ok',
    service: 'WaveReady Health Service',
    uptime: process.uptime ? process.uptime() : 0,
    timestamp: new Date().toISOString()
  });
}
