import { NextFunction, Request, Response } from 'express';
import jwt from 'express-jwt';

import { JwtAlg } from '../utils/jwt';

const secret = process.env.JWT_SECRET as string;

const authorization = () => {
  const jwtMiddleware = jwt({
    credentialsRequired: false,
    secret,
    algorithms: [JwtAlg],
  });

  return (req: Request, res: Response, next: NextFunction) => {
    // The request was already authorized as an OAuth client of the external
    // identity provider, whose token this middleware cannot verify.
    if (req.oauthClient) {
      return next();
    }

    return jwtMiddleware(req, res, next);
  };
};

export default authorization;
