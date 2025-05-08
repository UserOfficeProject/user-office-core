// eslint-disable-next-line import/order, @typescript-eslint/no-unused-vars
import startTracing from './src/middlewares/tracing/tracing';
import { logger } from '@user-office-software/duo-logger';
import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

import './src/env-loader.js';
import './src/config';

import { startAsyncJobs } from './src/asyncJobs/startAsyncJobs';
import { Tokens } from './src/config/Tokens';
import authorization from './src/middlewares/authorization';
import exceptionHandler from './src/middlewares/exceptionHandler';
import factory from './src/middlewares/factory';
import files from './src/middlewares/files';
import apolloServer from './src/middlewares/graphql';
import healthCheck from './src/middlewares/healthCheck';
import jwtErrorHandler from './src/middlewares/jwtErrorHandler';
import metrics from './src/middlewares/metrics/metrics';
import readinessCheck from './src/middlewares/readinessCheck';

async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: false }));
  app
    .use(metrics(app))
    .use(authorization())
    .use(jwtErrorHandler)
    .use(files())
    .use(factory())
    .use(healthCheck())
    .use(readinessCheck())
    .use(exceptionHandler());

  await apolloServer(app);

  app.listen(PORT);

  process.on('uncaughtException', (error) => {
    logger.logException('Unhandled NODE exception', error);
  });

  logger.logInfo(
    `Running a GraphQL API server at my local:${PORT}/graphql`,
    {}
  );

  startAsyncJobs(); // TODO: Should we do this here? Or those jobs should be started in a separate process?
  container.resolve<(() => void) | undefined>(Tokens.ConfigureLogger)?.();
  container.resolve<() => void>(Tokens.ConfigureEnvironment)();
}
startTracing();
bootstrap();
