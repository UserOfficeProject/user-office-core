import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { GenericTemplateAuthorization } from '../auth/GenericTemplateAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { GenericTemplatesArgs } from '../resolvers/queries/GenericTemplatesQuery';

@injectable()
export default class GenericTemplateQueries {
  private genericTemplateAuth = container.resolve(GenericTemplateAuthorization);

  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private dataSource: GenericTemplateDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getGenericTemplate(
    agent: UserWithRole | null,
    genericTemplateId: number
  ) {
    if (
      this.userAuth.isApiToken(agent) ||
      (await this.genericTemplateAuth.hasReadRights(
        agent,
        genericTemplateId
      )) !== true
    ) {
      logger.logWarn('Unauthorized getGenericTemplate access', {
        agent,
        genericTemplateId,
      });

      return null;
    }

    return this.dataSource.getGenericTemplate(genericTemplateId);
  }

  @Authorized()
  async getGenericTemplates(
    agent: UserWithRole | null,
    args: GenericTemplatesArgs
  ) {
    let genericTemplates = await this.dataSource.getGenericTemplates(
      args,
      agent
    );

    genericTemplates = await Promise.all(
      genericTemplates.map(
        (genericTemplate) =>
          this.userAuth.isApiToken(agent) ||
          this.genericTemplateAuth.hasReadRights(agent, genericTemplate.id)
      )
    ).then((results) => genericTemplates.filter((_v, index) => results[index]));

    return genericTemplates;
  }

  @Authorized()
  async genericTemplatesOnCopy(agent: UserWithRole | null) {
    let genericTemplates = await this.dataSource.getGenericTemplatesForCopy(
      agent?.id,
      agent?.currentRole
    );

    genericTemplates = await Promise.all(
      genericTemplates.map(
        (genericTemplate) =>
          this.userAuth.isApiToken(agent) ||
          this.genericTemplateAuth.hasReadRights(agent, genericTemplate.id)
      )
    ).then((results) => genericTemplates.filter((_v, index) => results[index]));

    return genericTemplates;
  }
}
