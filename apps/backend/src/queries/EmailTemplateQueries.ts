import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EmailTemplateDataSource } from '../datasources/EmailTemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { EmailTemplatesFilter } from '../resolvers/queries/EmailTemplatesQuery';

@injectable()
export default class EmailTemplateQueries {
  constructor(
    @inject(Tokens.EmailTemplateDataSource)
    public dataSource: EmailTemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, id: number) {
    return await this.dataSource.getEmailTemplate(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, filter: EmailTemplatesFilter) {
    return this.dataSource.getEmailTemplates(filter);
  }
}
