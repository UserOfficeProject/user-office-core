import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { GenericTemplateArgs } from '../resolvers/queries/GenericTemplateQuery';
import { GenericTemplateAuthorization } from '../utils/GenericTemplateAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';

@injectable()
export default class GenericTemplateQueries {
  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private dataSource: GenericTemplateDataSource,

    @inject(Tokens.GenericTemplateAuthorization)
    private genericTemplateAuthorization: GenericTemplateAuthorization,

    @inject(Tokens.ShipmentAuthorization)
    private shipmentAuthorization: ShipmentAuthorization
  ) {}

  async getGenericTemplate(
    agent: UserWithRole | null,
    genericTemplateId: number
  ) {
    if (
      (await this.genericTemplateAuthorization.hasReadRights(
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
    args: GenericTemplateArgs
  ) {
    let genericTemplates = await this.dataSource.getGenericTemplate(args);

    genericTemplates = await Promise.all(
      genericTemplates.map((genericTemplate) =>
        this.genericTemplateAuthorization.hasReadRights(
          agent,
          genericTemplate.id
        )
      )
    ).then((results) => genericTemplates.filter((_v, index) => results[index]));

    return genericTemplates;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getGenericTemplateByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getGenericTemplateByCallId(callId);
  }
}
