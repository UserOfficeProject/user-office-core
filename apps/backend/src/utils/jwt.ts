import { logger } from '@user-office-software/duo-logger';
import jsonwebtoken, {
  Algorithm,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';

const secret = process.env.secret as string;
const expiresIn = process.env.tokenLife as string;

if (!secret) {
  logger.logError(
    'Could not start application: the `secret` environment variable is missing. Exiting.',
    {}
  );
  process.exit(1);
}

if (!expiresIn) {
  logger.logError(
    'Could not start application: the `tokenLike` environment variable is missing. Exiting.',
    {}
  );
  process.exit(1);
}

export const JwtAlg: Algorithm = 'HS256';

export function signToken<T extends Record<string, unknown> | string | Buffer>(
  payload: T,
  signOptions?: SignOptions
) {
  return jsonwebtoken.sign(payload, secret, {
    expiresIn,
    algorithm: JwtAlg,
    ...signOptions,
  });
}

export function verifyToken<T extends Record<string, unknown> | string>(
  token: string,
  verifyOptions?: VerifyOptions
): T {
  return jsonwebtoken.verify(token, secret, {
    algorithms: [JwtAlg],
    ...verifyOptions,
  }) as T;
}
