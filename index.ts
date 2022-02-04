import { logger } from '@user-office-software/duo-logger';
import cookieParser from 'cookie-parser';
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
import readinessCheck from './src/middlewares/readinessCheck';

async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  const app = express();

  app
    .use(cookieParser())
    .use(authorization())
    .use(files())
    .use(factory())
    .use(healthCheck())
    .use(readinessCheck())
    .use(exceptionHandler())
    .use(express.json({ limit: '5mb' }));

  await apolloServer(app);

  app.listen(PORT);

  process.on('uncaughtException', (error) => {
    logger.logException('Unhandled NODE exception', error);
  });

  logger.logInfo(
    `Running a GraphQL API server at localhost:${PORT}/graphql`,
    {}
  );

  startAsyncJobs();
  container.resolve<(() => void) | undefined>(Tokens.ConfigureLogger)?.();
  container.resolve<() => void>(Tokens.ConfigureEnvironment)();
}

bootstrap();
