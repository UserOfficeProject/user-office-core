import { logger } from '@user-office-software/duo-logger';
import { NextFunction, Request, Response } from 'express';

const exceptionHandler =
  () =>
  (
    err: Error,
    { headers, method, url }: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.logException('Unhandled exception', {
      error: err.message,
      request: {
        headers,
        method,
        url,
      },
    });

    return res.sendStatus(500);
  };

export default exceptionHandler;
