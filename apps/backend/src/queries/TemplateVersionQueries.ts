import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateVersionDataSource } from '../datasources/TemplateVersionDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class TemplateVersionQueries {
  constructor(
    @inject(Tokens.TemplateVersionDataSource)
    public dataSource: TemplateVersionDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getVersions(
    agent: UserWithRole | null,
    id: number,
    templateType: string
  ) {
    return await this.dataSource.getVersions(id, templateType);
  }

  @Authorized([Roles.USER_OFFICER])
  async getVersion(
    agent: UserWithRole | null,
    id: number,
    versionNumber: number,
    templateType: string
  ) {
    return await this.dataSource.getVersion(id, versionNumber, templateType);
  }
}
