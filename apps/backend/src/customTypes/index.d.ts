import { AuthJwtPayload, AuthJwtApiTokenPayload } from '../models/User';

type AuthJwtPayloadUnionType = AuthJwtPayload & AuthJwtApiTokenPayload;

declare global {
  namespace Express {
    interface User extends AuthJwtPayloadUnionType {}
    interface Request {
      user: AuthJwtPayloadUnionType;
    }
  }
}
