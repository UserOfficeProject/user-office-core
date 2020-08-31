import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/Logger';
interface MiddlewareError extends Error {
  code: string | number;
}
const exceptionHandler = () => (
  err: MiddlewareError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.logException('Unhandled exception', err, { req, res });
  if (err.code === 'invalid_token') {
    return res.status(401).send('invalid token');
  }

  return res.sendStatus(500);
};

export default exceptionHandler;
