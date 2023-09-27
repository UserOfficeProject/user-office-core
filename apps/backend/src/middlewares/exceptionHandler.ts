import { logger } from '@user-office-software/duo-logger';
import { NextFunction, Request, Response } from 'express';

interface MiddlewareError extends Error {
  code: string | number;
}
const exceptionHandler =
  () =>
  (err: MiddlewareError, req: Request, res: Response, next: NextFunction) => {
    logger.logException('Unhandled exception', err);
    if (err.code === 'invalid_token') {
      return res.status(401).send('invalid token');
    }

    return res.sendStatus(500);
  };

export default exceptionHandler;
