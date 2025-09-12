import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalPdfTemplateDataSource } from '../datasources/ProposalPdfTemplateDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { ProposalPdfTemplatesArgs } from '../resolvers/queries/ProposalPdfTemplatesQuery';

@injectable()
export default class ProposalPdfTemplateQueries {
  constructor(
    @inject(Tokens.ProposalPdfTemplateDataSource)
    private dataSource: ProposalPdfTemplateDataSource
  ) {}

  @Authorized()
  async getProposalPdfTemplate(
    agent: UserWithRole | null,
    pdfTemplateId: number
  ) {
    return this.dataSource.getPdfTemplate(pdfTemplateId);
  }

  @Authorized()
  async getProposalPdfTemplates(
    agent: UserWithRole | null,
    args: ProposalPdfTemplatesArgs
  ) {
    return this.dataSource.getPdfTemplates(args);
  }
}
