import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import neaHandler from './api/NEA.ts';
import healthHandler from './api/health.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health check routes
  app.get('/health', (req, res) => healthHandler(req, res));
  app.get('/api/health', (req, res) => healthHandler(req, res));

  // Serverless API handlers matching Vercel routes
  app.all('/api/tides', (req, res) => {
    req.query = { ...req.query, endpoint: 'tides' };
    return neaHandler(req, res);
  });

  app.all('/api/uv', (req, res) => {
    req.query = { ...req.query, endpoint: 'uv' };
    return neaHandler(req, res);
  });

  app.all('/api/heat-stress', (req, res) => {
    req.query = { ...req.query, endpoint: 'heat-stress' };
    return neaHandler(req, res);
  });

  app.all('/api/wind-direction', (req, res) => {
    req.query = { ...req.query, endpoint: 'wind-direction' };
    return neaHandler(req, res);
  });

  app.all('/api/wind-speed', (req, res) => {
    req.query = { ...req.query, endpoint: 'wind-speed' };
    return neaHandler(req, res);
  });

  app.all('/api/rain', (req, res) => {
    req.query = { ...req.query, endpoint: 'rain' };
    return neaHandler(req, res);
  });

  app.all('/api/NEA', (req, res) => {
    return neaHandler(req, res);
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WaveReady server running at http://0.0.0.0:${PORT} [mode: ${isProduction ? 'prod' : 'dev'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
