import { AuthJwtApiTokenPayload, AuthJwtPayload } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user: AuthJwtPayload & AuthJwtApiTokenPayload;
    }
  }
}
