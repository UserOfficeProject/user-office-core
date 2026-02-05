import { inject, injectable } from 'tsyringe';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { AccessDataSource } from '../datasources/AccessDataSource';
import { AccessFilter } from '../resolvers/queries/AccessQuery';

@injectable()
export default class AccessQueries {
  constructor(@inject(Tokens.AccessDataSource) public dataSource: AccessDataSource)
  {}

  @Authorized()
  async getAccessRule(agent: UserWithRole | null, id: number) {
    return this.dataSource.getAccessRule(id);
  }

  @Authorized()
  async getAccessRules(agent: UserWithRole | null) {
    return this.dataSource.getAccessRules();
  }
}