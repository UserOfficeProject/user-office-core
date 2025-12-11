import { inject, injectable } from 'tsyringe';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { AccessDataSource } from '../datasources/AccessDataSource';
import { AccessFilter } from '../resolvers/queries/AccessQuery';
import { actions, subjects } from '../datasources/postgres/AccessDataSource';
import { Roles } from '../models/Role';

@injectable()
export default class AccessQueries {
  constructor(@inject(Tokens.AccessDataSource) public dataSource: AccessDataSource)
  {}

  @Authorized()
    async get(agent: UserWithRole | null, filter: AccessFilter) {
      const {userId, role, action, subject} = filter;

      return this.dataSource.canAccess(userId, role as Roles, action as typeof actions[number], subject as typeof subjects[number]);
    }
}