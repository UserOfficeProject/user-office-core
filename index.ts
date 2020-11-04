/* eslint-disable @typescript-eslint/no-unused-vars */
import 'dotenv/config';

import cookieParser from 'cookie-parser';
import express from 'express';

import 'reflect-metadata';
import ALL_AYNC_JOBS from './src/asyncJobs/allAsyncJobs';
import startAsyncJobs from './src/asyncJobs/startAsyncJobs';
import authorization from './src/middlewares/authorization';
import exceptionHandler from './src/middlewares/exceptionHandler';
import files from './src/middlewares/files';
import apolloServer from './src/middlewares/graphql';
import pdfFactory from './src/middlewares/pdfFactory';
import proposalDownload from './src/middlewares/proposalDownload';
import { logger } from './src/utils/Logger';

async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  const app = express();

  app
    .use(cookieParser())
    .use(authorization())
    .use(files())
    .use(
      process.env.UO_FEATURE_ENABLE_UO_FACTORY === '1'
        ? pdfFactory()
        : proposalDownload()
    )
    .use(exceptionHandler());

  await apolloServer(app);

  app.listen(PORT);

  process.on('uncaughtException', error => {
    logger.logException('Unhandled NODE exception', error);
  });

  console.info(`Running a GraphQL API server at localhost:${PORT}/graphql`);

  startAsyncJobs(ALL_AYNC_JOBS);
}

bootstrap();
