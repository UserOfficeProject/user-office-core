import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PdfTemplateDataSource } from '../datasources/PdfTemplateDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { PdfTemplatesArgs } from '../resolvers/queries/PdfTemplatesQuery';

@injectable()
export default class PdfTemplateQueries {
  constructor(
    @inject(Tokens.PdfTemplateDataSource)
    private dataSource: PdfTemplateDataSource
  ) {}

  @Authorized()
  async getPdfTemplate(agent: UserWithRole | null, pdfTemplateId: number) {
    return this.dataSource.getPdfTemplate(pdfTemplateId);
  }

  @Authorized()
  async getPdfTemplates(agent: UserWithRole | null, args: PdfTemplatesArgs) {
    return this.dataSource.getPdfTemplates(args);
  }
}
