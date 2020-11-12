import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { rejection } from '../rejection';
import { CreateSampleInput } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleArgs } from '../resolvers/mutations/UpdateSampleMutation';
import { logger } from '../utils/Logger';
import { sampleAuthorization } from '../utils/SampleAuthorization';
import { userAuthorization } from '../utils/UserAuthorization';

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

  async updateSample(agent: UserWithRole | null, args: UpdateSampleArgs) {
    if (!sampleAuthorization.hasWriteRights(agent, args.sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    // Thi makes sure administrative fields can be only updated by user with the right role
    if (args.safetyComment || args.safetyStatus) {
      const canAdministrerSample =
        (await userAuthorization.isUserOfficer(agent)) ||
        (await userAuthorization.isSampleSafetyReviewer(agent));
      if (canAdministrerSample === false) {
        delete args.safetyComment;
        delete args.safetyStatus;
      }
    }

    return this.sampleDataSource
      .updateSample(args)
      .then(sample => sample)
      .catch(error => {
        logger.logException('Could not update sample', error, {
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

    return this.sampleDataSource
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

  @Authorized()
  async cloneSample(agent: UserWithRole | null, sampleId: number) {
    if (!agent) {
      return rejection('NOT_AUTHORIZED');
    }
    if (!sampleAuthorization.hasWriteRights(agent, sampleId)) {
      return rejection('NOT_AUTHORIZED');
    }

    try {
      const sourceSample = await this.sampleDataSource.getSample(sampleId);
      const clonedQuestionary = await this.questionaryDataSource.clone(
        sourceSample.questionaryId
      );
      const clonedSample = await this.sampleDataSource.create(
        `Copy of ${sourceSample.title}`,
        agent.id,
        sourceSample.proposalId,
        clonedQuestionary.questionaryId,
        sourceSample.questionId
      );

      return clonedSample;
    } catch (e) {
      logger.logError('Could not clone sample', e);

      return rejection('INTERNAL_ERROR');
    }
  }
}
