import jsonwebtoken, {
  Algorithm,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';

const secret = process.env.secret as string;
const expiresIn = process.env.tokenLife as string;

if (!secret) {
  console.error('jwt secret missing');
  process.exit(1);
}

if (!expiresIn) {
  console.error('tokenLife missing');
  process.exit(1);
}

export const JwtAlg: Algorithm = 'HS256';

export function signToken<T extends object | string | Buffer>(
  payload: T,
  signOptions?: SignOptions
) {
  return jsonwebtoken.sign(payload, secret, {
    expiresIn,
    algorithm: JwtAlg,
    ...signOptions,
  });
}

export function verifyToken<T extends object | string>(
  token: string,
  verifyOptions?: VerifyOptions
): T {
  return jsonwebtoken.verify(token, secret, {
    algorithms: [JwtAlg],
    ...verifyOptions,
  }) as T;
}
