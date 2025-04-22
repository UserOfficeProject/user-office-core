import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalPdfTemplateDataSource } from '../datasources/ProposalPdfTemplateDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateProposalPdfTemplateInput } from '../resolvers/mutations/CreateProposalPdfTemplateMutation';
import { UpdateProposalPdfTemplateArgs } from '../resolvers/mutations/UpdateProposalPdfTemplateMutation';

@injectable()
export default class ProposalPdfTemplateMutations {
  constructor(
    @inject(Tokens.ProposalPdfTemplateDataSource)
    private proposalPdfTemplateDataSource: ProposalPdfTemplateDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createProposalPdfTemplate(
    agent: UserWithRole | null,
    args: CreateProposalPdfTemplateInput
  ) {
    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (
      !template ||
      template?.groupId !== TemplateGroupId.PROPOSAL_PDF_TEMPLATE
    ) {
      return rejection('Can not create PDF template with this template', {
        agent,
        args,
      });
    }

    try {
      return await this.proposalPdfTemplateDataSource.createPdfTemplate({
        templateId: template.templateId,
        templateData: args.templateData,
        templateHeader: args.templateHeader,
        templateFooter: args.templateFooter,
        templateSampleDeclaration: args.templateSampleDeclaration,
        dummyData: args.dummyData,
        creatorId: (agent as UserWithRole).id,
      });
    } catch (error) {
      return rejection('Can not create PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async updateProposalPdfTemplate(
    agent: UserWithRole | null,
    args: UpdateProposalPdfTemplateArgs
  ) {
    try {
      return await this.proposalPdfTemplateDataSource.updatePdfTemplate(args);
    } catch (error) {
      return rejection('Can not update PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteProposalPdfTemplate(
    agent: UserWithRole | null,
    pdfTemplateId: number
  ) {
    try {
      return await this.proposalPdfTemplateDataSource.delete(pdfTemplateId);
    } catch (error) {
      return rejection(
        'Can not delete PDF template because an error occurred',
        { agent, pdfTemplateId },
        error
      );
    }
  }
}
