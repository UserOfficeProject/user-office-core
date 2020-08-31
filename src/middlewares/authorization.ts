import jwt from 'express-jwt';
const secret = process.env.secret as string;
const authorization = () =>
  jwt({
    credentialsRequired: false,
    secret,
  });

export default authorization;
