import { Request, Response } from 'express';
import client from 'prom-client';
import { Config } from '.';

export const registry = new client.Registry();

registry.setDefaultLabels({
  app: 'backend_template',
  env: Config.NODE_ENV,
});

// Default metrics about CPU, memory, event loop, etc.
client.collectDefaultMetrics({ register: registry });

// Custom application metrics
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const httpRequestTimer = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Metrics handler
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
};
