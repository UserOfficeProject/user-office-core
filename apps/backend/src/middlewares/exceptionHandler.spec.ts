import { logger } from '@user-office-software/duo-logger';
import { NextFunction, Request, Response } from 'express';

import exceptionHandler from './exceptionHandler';

jest.mock('@user-office-software/duo-logger');

describe('exceptionHandler', () => {
  it('should log error and return 500 status code', () => {
    const err = new Error('Test error');
    const req = {
      headers: {},
      method: 'POST',
      url: '/graphql',
    } as Request;
    const res = {
      sendStatus: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    exceptionHandler()(err, req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(500);

    expect(logger.logException).toHaveBeenCalledWith('Unhandled exception', {
      error: err.message,
      request: {
        headers: req.headers,
        method: req.method,
        url: req.url,
      },
    });

    expect(next).not.toHaveBeenCalled();
  });
});
