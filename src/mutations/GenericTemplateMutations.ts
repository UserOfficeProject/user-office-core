import { container, inject, injectable } from 'tsyringe';

import { GenericTemplateAuthorization } from '../auth/GenericTemplateAuthorization';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateGenericTemplateInput } from '../resolvers/mutations/CreateGenericTemplateMutation';
import { UpdateGenericTemplateArgs } from '../resolvers/mutations/UpdateGenericTemplateMutation';

@injectable()
export default class GenericTemplateMutations {
  private genericTemplateAuth = container.resolve(GenericTemplateAuthorization);
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource
  ) {}

  @Authorized()
  async createGenericTemplate(
    agent: UserWithRole | null,
    args: CreateGenericTemplateInput
  ) {
    if (!agent) {
      return rejection(
        'Can not create genericTemplate because user is not authorized',
        {
          agent,
          args,
        }
      );
    }

    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (template?.groupId !== TemplateGroupId.GENERIC_TEMPLATE) {
      return rejection('Can not create genericTemplate with this template', {
        agent,
        args,
      });
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection(
        'Can not create genericTemplate because proposal was not found',
        {
          agent,
          args,
        }
      );
    }

    const canReadProposal = await this.proposalAuth.hasReadRights(
      agent,
      proposal
    );
    if (canReadProposal === false) {
      return rejection(
        'Can not create genericTemplate because of insufficient permissions',
        { agent, args }
      );
    }

    return this.questionaryDataSource
      .create(agent.id, args.templateId)
      .then((questionary) => {
        return this.genericTemplateDataSource.create(
          args.title,
          agent.id,
          args.proposalPk,
          questionary.questionaryId,
          args.questionId
        );
      })
      .catch((error) => {
        return rejection(
          'Can not create genericTemplate because an error occurred',
          { agent, args },
          error
        );
      });
  }

  @Authorized()
  async updateGenericTemplate(
    agent: UserWithRole | null,
    args: UpdateGenericTemplateArgs
  ) {
    const hasWriteRights = await this.genericTemplateAuth.hasWriteRights(
      agent,
      args.genericTemplateId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not update genericTemplate because of insufficient permissions',
        { agent, args }
      );
    }

    return this.genericTemplateDataSource
      .updateGenericTemplate(args)
      .then((genericTemplate) => genericTemplate)
      .catch((error) => {
        return rejection(
          'Can not update genericTemplate because an error occurred',
          { agent, args },
          error
        );
      });
  }

  @Authorized()
  async deleteGenericTemplate(
    agent: UserWithRole | null,
    genericTemplateId: number
  ) {
    const hasWriteRights = await this.genericTemplateAuth.hasWriteRights(
      agent,
      genericTemplateId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not delete genericTemplate because of insufficient permissions',
        { agent, genericTemplateId }
      );
    }

    return this.genericTemplateDataSource
      .delete(genericTemplateId)
      .then((genericTemplate) => genericTemplate)
      .catch((error) => {
        return rejection(
          'Can not delete genericTemplate because an error occurred',
          { agent, genericTemplateId },
          error
        );
      });
  }

  @Authorized()
  async cloneGenericTemplate(
    agent: UserWithRole | null,
    genericTemplateId: number,
    title?: string
  ) {
    if (!agent) {
      return rejection(
        'Could not clone genericTemplate because user is not authorized',
        { agent, genericTemplateId }
      );
    }
    if (
      !(await this.genericTemplateAuth.hasWriteRights(agent, genericTemplateId))
    ) {
      return rejection(
        'Could not clone genericTemplate because of insufficient permissions',
        { agent, genericTemplateId }
      );
    }

    try {
      let clonedGenericTemplate =
        await this.genericTemplateDataSource.cloneGenericTemplate(
          genericTemplateId
        );
      clonedGenericTemplate =
        await this.genericTemplateDataSource.updateGenericTemplate({
          genericTemplateId: clonedGenericTemplate.id,
          title: title ? title : `Copy of ${clonedGenericTemplate.title}`,
        });

      return clonedGenericTemplate;
    } catch (error) {
      return rejection(
        'Could not clone genericTemplate because an error occurred',
        { agent, genericTemplateId },
        error
      );
    }
  }
}
