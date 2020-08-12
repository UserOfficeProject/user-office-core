import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { rejection } from '../rejection';
import { CreateSampleArgs } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleStatusArgs } from '../resolvers/mutations/UpdateSampleStatusMutation';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitleMutation';
import { Logger, logger } from '../utils/Logger';
import { sampleAuthorization } from '../utils/SampleAuthorization';

export default class SampleMutations {
  constructor(
    private dataSource: SampleDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private logger: Logger
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  updateSampleStatus(user: UserWithRole | null, args: UpdateSampleStatusArgs) {
    return this.dataSource.updateSampleStatus(args);
  }

  @Authorized()
  async createSample(agent: UserWithRole | null, args: CreateSampleArgs) {
    if (!agent) {
      return rejection('NOT_AUTHORIZED');
    }
    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (template?.categoryId !== TemplateCategoryId.SAMPLE_DECLARATION) {
      logger.logError('Cant create sample with this template', {
        args,
        agent,
      });

      return rejection('INTERNAL_ERROR');
    }

    const questionary = await this.questionaryDataSource.create(
      agent.id,
      args.templateId
    );

    return await this.dataSource.create(
      questionary.questionaryId!,
      args.title,
      agent.id
    );
  }

  async updateSampleTitle(
    agent: UserWithRole | null,
    args: UpdateSampleTitleArgs
  ) {
    if (!sampleAuthorization.hasWriteRights(agent, args.sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.dataSource.updateSampleTitle(args);
  }

  async deleteSample(agent: UserWithRole | null, sampleId: number) {
    if (!sampleAuthorization.hasWriteRights(agent, sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.dataSource.delete(sampleId);
  }
}
