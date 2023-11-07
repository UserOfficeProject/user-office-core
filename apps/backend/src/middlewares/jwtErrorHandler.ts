import { logger } from '@user-office-software/duo-logger';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';

// It is used as a middleware in the express app to handle errors thrown by the express-jwt
export default function jwtErrorHandler(
  err: Error | UnauthorizedError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof UnauthorizedError) {
    logger.logWarn('Unauthorized request', {
      message: err.inner.message,
      request: {
        headers: req.headers,
        method: req.method,
        url: req.url,
      },
    });

    return res.status(err.status).send(err.inner.message);
  }

  // If error is not of type UnauthorizedError, then it is not handled here.
  // It is passed to the next error handler middleware.
  return next(err);
}
