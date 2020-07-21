import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateCategoryId } from '../models/ProposalModel';
import { User } from '../models/User';
import { rejection } from '../rejection';
import { Logger, logger } from '../utils/Logger';
import { CreateSampleArgs } from '../resolvers/mutations/CreateSampleMutations';

export default class SampleMutations {
  constructor(
    private dataSource: SampleDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private logger: Logger
  ) {}

  @Authorized()
  async createSample(agent: User | null, args: CreateSampleArgs) {
    if (!agent) {
      return rejection('NOT_AUTHORIZED');
    }
    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (template?.categoryId !== TemplateCategoryId.SAMPLE_DECLARATION) {
      logger.logError("Can't create sample with this template", {
        args,
        agent,
      });
      return rejection('INTERNAL_ERROR');
    }

    const questionary = await this.questionaryDataSource.create(
      agent.id,
      args.templateId
    );
    return await this.dataSource.create(questionary.questionaryId!, args.title);
  }
}
