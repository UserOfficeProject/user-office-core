import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { UserWithRole } from '../models/User';
import { GenericTemplate } from './../resolvers/types/GenericTemplate';
import { ProposalAuthorization } from './ProposalAuthorization';

@injectable()
export class GenericTemplateAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource
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
    return this.proposalAuth.hasReadRights(agent, genericTemplate.proposalPk);
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
    return this.proposalAuth.hasWriteRights(agent, genericTemplate.proposalPk);
  }
}
