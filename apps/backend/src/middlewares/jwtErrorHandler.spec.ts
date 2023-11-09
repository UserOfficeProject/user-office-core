import { logger } from '@user-office-software/duo-logger';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';

import jwtErrorHandler from './jwtErrorHandler';

jest.mock('@user-office-software/duo-logger');

describe('jwtErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle UnauthorizedError, log them, and return error status code', () => {
    const err = new UnauthorizedError('invalid_token', {
      message: 'invalid_token',
    });
    const req = {
      headers: {},
      method: 'POST',
      url: '/graphql',
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    jwtErrorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(err.status);
    expect(res.send).toHaveBeenCalledWith(err.inner.message);
    expect(logger.logWarn).toHaveBeenCalledWith('Unauthorized request', {
      message: err.inner.message,
      request: {
        headers: req.headers,
        method: req.method,
        url: req.url,
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass other errors to the next middleware', () => {
    const err = new Error('Test error');
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    jwtErrorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(logger.logWarn).not.toHaveBeenCalled();
  });
});
