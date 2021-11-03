import { logger } from '@esss-swap/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { UserWithRole } from '../models/User';
import { GenericTemplatesArgs } from '../resolvers/queries/GenericTemplatesQuery';
import { GenericTemplateAuthorization } from '../utils/GenericTemplateAuthorization';

@injectable()
export default class GenericTemplateQueries {
  private genericTemplateAuth = container.resolve(GenericTemplateAuthorization);

  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private dataSource: GenericTemplateDataSource
  ) {}

  async getGenericTemplate(
    agent: UserWithRole | null,
    genericTemplateId: number
  ) {
    if (
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

  async getGenericTemplates(
    agent: UserWithRole | null,
    args: GenericTemplatesArgs
  ) {
    let genericTemplates = await this.dataSource.getGenericTemplates(args);

    genericTemplates = await Promise.all(
      genericTemplates.map((genericTemplate) =>
        this.genericTemplateAuth.hasReadRights(agent, genericTemplate.id)
      )
    ).then((results) => genericTemplates.filter((_v, index) => results[index]));

    return genericTemplates;
  }
}
