import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentSafetyPdfTemplateDataSource } from '../datasources/ExperimentSafetyPdfTemplateDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { ExperimentSafetyPdfTemplatesArgs } from '../resolvers/queries/ExperimentSafetyPdfTemplatesQuery';

@injectable()
export default class ExperimentSafetyPdfTemplateQueries {
  constructor(
    @inject(Tokens.ExperimentSafetyPdfTemplateDataSource)
    private dataSource: ExperimentSafetyPdfTemplateDataSource
  ) {}

  @Authorized()
  async getExperimentSafetyPdfTemplate(
    agent: UserWithRole | null,
    pdfTemplateId: number
  ) {
    return this.dataSource.getPdfTemplate(pdfTemplateId);
  }

  @Authorized()
  async getExperimentSafetyPdfTemplates(
    agent: UserWithRole | null,
    args: ExperimentSafetyPdfTemplatesArgs
  ) {
    return this.dataSource.getPdfTemplates(args);
  }
}
