import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PdfTemplateDataSource } from '../datasources/PdfTemplateDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreatePdfTemplateInput } from '../resolvers/mutations/CreatePdfTemplateMutation';
import { UpdatePdfTemplateArgs } from '../resolvers/mutations/UpdatePdfTemplateMutation';

@injectable()
export default class PdfTemplateMutations {
  constructor(
    @inject(Tokens.PdfTemplateDataSource)
    private pdfTemplateDataSource: PdfTemplateDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createPdfTemplate(
    agent: UserWithRole | null,
    args: CreatePdfTemplateInput
  ) {
    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (!template || template?.groupId !== TemplateGroupId.PDF_TEMPLATE) {
      return rejection('Can not create PDF template with this template', {
        agent,
        args,
      });
    }

    try {
      return await this.pdfTemplateDataSource.createPdfTemplate({
        templateId: template.templateId,
        templateData: args.templateData,
        templateHeader: args.templateHeader,
        templateFooter: args.templateFooter,
        templateSampleDeclaration: args.templateSampleDeclaration,
        creatorId: (agent as UserWithRole).id,
      });
    } catch (error) {
      return rejection('Can not create PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async updatePdfTemplate(
    agent: UserWithRole | null,
    args: UpdatePdfTemplateArgs
  ) {
    try {
      return await this.pdfTemplateDataSource.updatePdfTemplate(args);
    } catch (error) {
      return rejection('Can not update PDF template', { agent, args }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deletePdfTemplate(agent: UserWithRole | null, pdfTemplateId: number) {
    try {
      return await this.pdfTemplateDataSource.delete(pdfTemplateId);
    } catch (error) {
      return rejection(
        'Can not delete PDF template because an error occurred',
        { agent, pdfTemplateId },
        error
      );
    }
  }
}
