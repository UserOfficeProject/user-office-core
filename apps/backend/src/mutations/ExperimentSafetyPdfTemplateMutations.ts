import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentSafetyPdfTemplateDataSource } from '../datasources/ExperimentSafetyPdfTemplateDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateExperimentSafetyPdfTemplateInput } from '../resolvers/mutations/CreateExperimentSafetyPdfTemplateMutation';
import { UpdateExperimentSafetyPdfTemplateArgs } from '../resolvers/mutations/UpdateExperimentSafetyPdfTemplateMutation';

@injectable()
export default class ExperimentSafetyPdfTemplateMutations {
  constructor(
    @inject(Tokens.ExperimentSafetyPdfTemplateDataSource)
    private experimentSafetyPdfTemplateDataSource: ExperimentSafetyPdfTemplateDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createExperimentSafetyPdfTemplate(
    agent: UserWithRole | null,
    args: CreateExperimentSafetyPdfTemplateInput
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
      return await this.experimentSafetyPdfTemplateDataSource.createPdfTemplate(
        {
          templateId: template.templateId,
          templateData: args.templateData,
          templateHeader: args.templateHeader,
          templateFooter: args.templateFooter,
          templateSampleDeclaration: args.templateSampleDeclaration,
          dummyData: args.dummyData,
          creatorId: (agent as UserWithRole).id,
        }
      );
    } catch (error) {
      return rejection('Can not create PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async updateExperimentSafetyPdfTemplate(
    agent: UserWithRole | null,
    args: UpdateExperimentSafetyPdfTemplateArgs
  ) {
    try {
      return await this.experimentSafetyPdfTemplateDataSource.updatePdfTemplate(
        args
      );
    } catch (error) {
      return rejection('Can not update PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteExperimentSafetyPdfTemplate(
    agent: UserWithRole | null,
    pdfTemplateId: number
  ) {
    try {
      return await this.experimentSafetyPdfTemplateDataSource.delete(
        pdfTemplateId
      );
    } catch (error) {
      return rejection(
        'Can not delete PDF template because an error occurred',
        { agent, pdfTemplateId },
        error
      );
    }
  }
}
