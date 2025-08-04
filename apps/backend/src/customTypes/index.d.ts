import { AuthJwtPayload, AuthJwtApiTokenPayload } from '../models/User';

type AuthJwtPayloadUnionType = AuthJwtPayload & AuthJwtApiTokenPayload;

declare global {
  namespace Express {
    interface User extends AuthJwtPayloadUnionType {}
  }
}

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
      whereILikeEscaped(column: string, userInput: string): QueryBuilder;
      orWhereILikeEscaped(column: string, userInput: string): QueryBuilder;
    }
  }
}
