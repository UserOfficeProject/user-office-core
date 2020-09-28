import { questionaryDataSource } from '../datasources';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { rejection } from '../rejection';
import { CreateSampleArgs } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleSafetyReviewArgs } from '../resolvers/mutations/UpdateSampleSafetyReviewMutation';
import { UpdateSampleStatusArgs } from '../resolvers/mutations/UpdateSampleStatusMutation';
import { UpdateSampleTitleArgs } from '../resolvers/mutations/UpdateSampleTitleMutation';
import { Sample } from '../resolvers/types/Sample';
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
  updateSampleStatus(agent: UserWithRole | null, args: UpdateSampleStatusArgs) {
    return this.dataSource
      .updateSampleStatus(args)
      .then(sample => sample)
      .catch(error => {
        logger.logException('Could not update sample status', error, {
          agent,
          args,
        });
      });
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

    return this.questionaryDataSource
      .create(agent.id, args.templateId)
      .then(questionary => {
        return this.dataSource.create(
          questionary.questionaryId!,
          args.title,
          agent.id
        );
      })
      .catch(error => {
        logger.logException('Could not create sample', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async updateSampleTitle(
    agent: UserWithRole | null,
    args: UpdateSampleTitleArgs
  ) {
    if (!sampleAuthorization.hasWriteRights(agent, args.sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.dataSource
      .updateSampleTitle(args)
      .then(sample => sample)
      .catch(error => {
        logger.logException('Could not update sample title', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async deleteSample(agent: UserWithRole | null, sampleId: number) {
    if (!sampleAuthorization.hasWriteRights(agent, sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.dataSource
      .delete(sampleId)
      .then(sample => sample)
      .catch(error => {
        logger.logException('Could not delete sample', error, {
          agent,
          sampleId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async updateSampleSafetyReview(
    agent: UserWithRole | null,
    args: UpdateSampleSafetyReviewArgs
  ) {
    if (!sampleAuthorization.hasWriteRights(agent, args.id)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.dataSource.updateSampleSafetyReview(args);
  }

  @Authorized()
  async cloneSample(
    user: UserWithRole | null,
    sampleId: number
  ): Promise<Sample> {
    const sourceSample = await this.dataSource.getSample(sampleId);
    const clonedQuestionary = await this.questionaryDataSource.clone(
      sourceSample.questionaryId
    );
    const clonedSample = this.dataSource.create(
      clonedQuestionary.questionaryId!,
      `Copy of ${sourceSample.title}`,
      sourceSample.creatorId
    );

    return clonedSample;
  }
}
