import { inject, injectable } from 'tsyringe';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { AccessDataSource } from '../datasources/AccessDataSource';
import { Action, Subject } from '../datasources/postgres/AccessDataSource';
import { AccessFilter } from '../resolvers/queries/AccessQuery';

@injectable()
export default class AccessQueries {
  constructor(@inject(Tokens.AccessDataSource) public dataSource: AccessDataSource)
  {}

  @Authorized()
    async get(agent: UserWithRole | null, filter: AccessFilter) {
      const {userId, action} = filter;

      return this.dataSource.canAccess(userId, action as Action);
    }
}