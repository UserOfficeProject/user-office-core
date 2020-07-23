import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateCategoryId } from '../models/ProposalModel';
import { Sample } from '../models/Sample';
import { User } from '../models/User';
import { rejection } from '../rejection';
import { AddSamplesToAnswerArgs } from '../resolvers/mutations/AddSamplesToAnswer';
import { CreateSampleArgs } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitle';
import { Logger, logger } from '../utils/Logger';

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
  async addSamplesToAnswer(agent: User | null, args: AddSamplesToAnswerArgs) {
    // TODO perform authorization
    const response: Sample[] = [];
    for (const sampleId of args.sampleIds) {
      const sample = await this.dataSource.getSample(sampleId);
      if (!sample) {
        logger.logError('Counld not find sample', { sampleId });
        return rejection('INTERNAL_ERROR');
      }
      await this.questionaryDataSource.insertAnswerHasQuestionaries(
        args.answerId,
        sample.questionaryId
      );
      response.push(sample);
    }
    return response;
  }
}
