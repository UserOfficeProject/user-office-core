import jwt from 'express-jwt';

import { JwtAlg } from '../utils/jwt';

const secret = process.env.secret as string;

const authorization = () =>
  jwt({
    credentialsRequired: false,
    secret,
    algorithms: [JwtAlg],
  });

export default authorization;
