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
import { Logger, logger } from '../utils/Logger';
import { sampleAuthorization } from '../utils/SampleAuthorization';

export default class SampleMutations {
  constructor(
    private sampleDataSource: SampleDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private proposalDataSource: ProposalDataSource
  ) {}

  @Authorized()
  async createSample(agent: UserWithRole | null, args: CreateSampleInput) {
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

    const proposal = await this.proposalDataSource.get(args.proposalId);
    if (!proposal) {
      return rejection('NOT_FOUND');
    }

    if ((await userAuthorization.hasAccessRights(agent, proposal)) === false) {
      return rejection('NOT_ALLOWED');
    }

    return this.questionaryDataSource
      .create(agent.id, args.templateId)
      .then(questionary => {
        return this.sampleDataSource.create(
          args.title,
          agent.id,
          args.proposalId,
          questionary.questionaryId,
          args.questionId
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
  async cloneSample(agent: UserWithRole | null, sampleId: number) {
    if (!sampleAuthorization.hasWriteRights(agent, sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    try {
      const sourceSample = await this.dataSource.getSample(sampleId);
      const clonedQuestionary = await this.questionaryDataSource.clone(
        sourceSample.questionaryId
      );
      const clonedSample = await this.dataSource.create(
        clonedQuestionary.questionaryId!,
        `Copy of ${sourceSample.title}`,
        sourceSample.creatorId
      );

      return clonedSample;
    } catch (e) {
      logger.logError('Could not clone sample', e);

      return rejection('INTERNAL_ERROR');
    }
  }
}
