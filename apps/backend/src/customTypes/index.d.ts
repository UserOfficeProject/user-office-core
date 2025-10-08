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
      /**
       * Custom query builder methods for **case-insensitive** LIKE queries with escaped input.
       * Example usage:
       * db('users').whereILikeEscaped('name', '%?%', userInput)
       * db('users').whereILikeEscaped('name', '_?', userInput)
       */
      whereILikeEscaped(
        column: string,
        query: string,
        userInput: string
      ): QueryBuilder;
      /**
       * Custom query builder methods for **case-insensitive** LIKE queries with escaped input.
       * Example usage:
       * db('users').orWhereILikeEscaped('name', '%?%', userInput)
       * db('users').orWhereILikeEscaped('name', '_?', userInput)

       */
      orWhereILikeEscaped(
        column: string,
        query: string,
        userInput: string
      ): QueryBuilder;

      whereJsonbPathLike(
        column: string, 
        userInput: string
      ) : QueryBuilder;

      orWhereJsonbPathLike(
        column: string, 
        userInput: string
      ) : QueryBuilder;
    }
  }
}
