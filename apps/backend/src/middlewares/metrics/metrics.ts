import express, { Request, Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
import { Counter, Histogram } from 'prom-client';

// Collect default node.js metrics
collectDefaultMetrics();

const router = express.Router();

// Expose metrics for Prometheus (ATTENTION: don't expose this endpoint to the public)
router.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Define the metrics
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Middleware to collect metrics
export default function (app: express.Application) {
  // Middleware to measure the duration of each request
  app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();

    res.on('finish', () => {
      // Measure the duration of the request
      end({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode,
      });

      // Count the number of requests
      httpRequestCounter.inc({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode,
      });
    });

    next();
  });

  return router;
}
