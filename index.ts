/* eslint-disable @typescript-eslint/no-unused-vars */
import cookieParser from 'cookie-parser';
import express from 'express';

import 'reflect-metadata';
import authorization from './src/middlewares/authorization';
import exceptionHandler from './src/middlewares/exceptionHandler';
import files from './src/middlewares/files';
import apolloServer from './src/middlewares/graphql';
import proposalDownload from './src/middlewares/proposalDownload';
import { logger } from './src/utils/Logger';

async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  const app = express();

  app
    .use(cookieParser())
    .use(authorization())
    .use(files())
    .use(proposalDownload())
    .use(exceptionHandler());

  await apolloServer(app);

  app.listen(PORT);

  process.on('uncaughtException', error => {
    logger.logException('Unhandled NODE exception', error);
  });

  console.info(`Running a GraphQL API server at localhost:${PORT}/graphql`);
}

bootstrap();
