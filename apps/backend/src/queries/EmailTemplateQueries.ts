import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
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
    public dataSource: EmailTemplateDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, id: number) {
    const emailTemplate = await this.dataSource.getEmailTemplate(id);

    if (!emailTemplate) {
      return null;
    }

    if (this.userAuth.isApiToken(agent) || this.userAuth.isUserOfficer(agent)) {
      return emailTemplate;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, filter: EmailTemplatesFilter) {
    const emailTemplates = this.dataSource.getEmailTemplates(filter);

    if (this.userAuth.isApiToken(agent) || this.userAuth.isUserOfficer(agent)) {
      return emailTemplates;
    } else {
      return null;
    }
  }
}
