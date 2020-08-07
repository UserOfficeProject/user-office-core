import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Sample } from '../models/Sample';
import { TemplateCategoryId } from '../models/Template';
import { User, UserWithRole } from '../models/User';
import { rejection } from '../rejection';
import { CreateSampleArgs } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleStatusArgs } from '../resolvers/mutations/UpdateSampleStatus';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitle';
import { Logger, logger } from '../utils/Logger';

export default class SampleMutations {
  constructor(
    private dataSource: SampleDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private logger: Logger
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  updateSampleStatus(
    user: UserWithRole | null,
    args: UpdateSampleStatusArgs
  ): Promise<Sample> {
    return this.dataSource.updateSampleStatus(args);
  }

  @Authorized()
  async createSample(agent: User | null, args: CreateSampleArgs) {
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

  @Authorized()
  updateSampleTitle(agent: User | null, args: UpdateSampleTitleArgs) {
    // TODO perform authorization
    return this.dataSource.updateSampleTitle(args);
  }

  @Authorized()
  async deleteSample(agent: User | null, sampleId: number): Promise<Sample> {
    // TODO perform authorization
    return this.dataSource.delete(sampleId);
  }
}
