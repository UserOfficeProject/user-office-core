import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PdfTemplateDataSource } from '../datasources/PdfTemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { PdfTemplatesArgs } from '../resolvers/queries/PdfTemplatesQuery';

@injectable()
export default class PdfTemplateQueries {
  constructor(
    @inject(Tokens.PdfTemplateDataSource)
    private dataSource: PdfTemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getPdfTemplate(agent: UserWithRole | null, pdfTemplateId: number) {
    return this.dataSource.getPdfTemplate(pdfTemplateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getPdfTemplates(agent: UserWithRole | null, args: PdfTemplatesArgs) {
    return this.dataSource.getPdfTemplates(args);
  }
}
