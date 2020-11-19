import {
  proposalDataSource,
  questionaryDataSource,
  sampleDataSource,
  templateDataSource,
} from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { TemplateCategoryId } from '../models/Template';
import { User, UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';
import { logger } from './Logger';

interface QuestionaryAuthorizer {
  hasReadRights(agent: User | null, questionaryId: number): Promise<boolean>;
  hasWriteRights(agent: User | null, questionaryId: number): Promise<boolean>;
}

class ProposalQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(private proposalDataSource: ProposalDataSource) {}
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }

  private async hasRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    const proposal = (
      await this.proposalDataSource.getProposals({
        questionaryIds: [questionaryId],
      })
    ).proposals[0];

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}

class SampleDeclarationQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    private proposalDataSource: ProposalDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private sampleDataSource: SampleDataSource
  ) {}
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }

  private async hasRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const queryResult = await this.sampleDataSource.getSamples({
      filter: { questionaryId },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const sample = queryResult[0];

    const proposal = await proposalDataSource.get(sample.proposalId);

    if (!proposal) {
      logger.logError('Could not find proposal for questionary', {
        questionaryId,
      });

      return false;
    }

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}

export class QuestionaryAuthorization {
  private authorizers = new Map<number, QuestionaryAuthorizer>();
  constructor(
    private proposalDataSource: ProposalDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource
  ) {
    this.authorizers.set(
      TemplateCategoryId.PROPOSAL_QUESTIONARY,
      new ProposalQuestionaryAuthorizer(this.proposalDataSource)
    );
    this.authorizers.set(
      TemplateCategoryId.SAMPLE_DECLARATION,
      new SampleDeclarationQuestionaryAuthorizer(
        proposalDataSource,
        questionaryDataSource,
        sampleDataSource
      )
    );
  }

  private async getTemplateCategoryIdForQuestionary(questionaryId: number) {
    const templateId = (
      await this.questionaryDataSource.getQuestionary(questionaryId)
    )?.templateId;
    if (!templateId) return null;

    const categoryId = (await this.templateDataSource.getTemplate(templateId))
      ?.categoryId;
    if (!categoryId) return null;

    return categoryId;
  }

  private async getAuthorizer(questionaryId: number) {
    const categoryId = await this.getTemplateCategoryIdForQuestionary(
      questionaryId
    );
    if (!categoryId) return null;

    return this.authorizers.get(categoryId);
  }

  async hasReadRights(agent: User | null, questionaryId: number) {
    return (
      (await this.getAuthorizer(questionaryId))?.hasReadRights(
        agent,
        questionaryId
      ) || false
    );
  }

  async hasWriteRights(agent: User | null, questionaryId: number) {
    return (
      (await this.getAuthorizer(questionaryId))?.hasWriteRights(
        agent,
        questionaryId
      ) || false
    );
  }
}

export const questionaryAuthorization = new QuestionaryAuthorization(
  proposalDataSource,
  questionaryDataSource,
  templateDataSource
);
