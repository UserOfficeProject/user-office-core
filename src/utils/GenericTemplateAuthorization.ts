import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { UserWithRole } from '../models/User';
import { GenericTemplate } from './../resolvers/types/GenericTemplate';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class GenericTemplateAuthorization {
  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,

    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  private async resolveGenericTemplate(
    genericTemplateOrGenericTemplateId: GenericTemplate | number
  ): Promise<GenericTemplate | null> {
    let genericTemplate;

    if (typeof genericTemplateOrGenericTemplateId === 'number') {
      genericTemplate = await this.genericTemplateDataSource.getGenericTemplate(
        genericTemplateOrGenericTemplateId
      );
    } else {
      genericTemplate = genericTemplateOrGenericTemplateId;
    }

    return genericTemplate;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    genericTemplate: GenericTemplate
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    genericTemplateId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    genericTemplateOrGenericTemplateId: GenericTemplate | number
  ): Promise<boolean> {
    return this.hasAccessRights(agent, genericTemplateOrGenericTemplateId);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    genericTemplate: GenericTemplate
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    genericTemplate: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    genericTemplateOrGenericTemplateId: GenericTemplate | number
  ): Promise<boolean> {
    return this.hasAccessRights(agent, genericTemplateOrGenericTemplateId);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    genericTemplateOrGenericTemplateId: GenericTemplate | number
  ) {
    // User officer has access
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const genericTemplate = await this.resolveGenericTemplate(
      genericTemplateOrGenericTemplateId
    );

    if (!genericTemplate) {
      return false;
    }

    /*
     * For the genericTemplate the authorization follows the business logic for the proposal
     * authorization that the genericTemplate is associated with
     */
    return this.userAuthorization.hasAccessRights(
      agent,
      genericTemplate.proposalPk
    );
  }
}
