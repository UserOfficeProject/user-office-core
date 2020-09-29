import {
  proposalDataSource,
  questionaryDataSource,
  templateDataSource,
} from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { TemplateCategoryId } from '../models/Template';
import { User, UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';

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
    private questionaryDataSource: QuestionaryDataSource
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

    const sampleDeclarationQuestionary = await this.questionaryDataSource.getQuestionary(
      questionaryId
    );
    if (sampleDeclarationQuestionary?.creatorId === agent.id) {
      return true;
    }

    const proposalQuestionary = await this.questionaryDataSource.getParentQuestionary(
      questionaryId
    );
    if (!proposalQuestionary) return false;
    if (!proposalQuestionary.questionaryId) return false;

    const result = await this.proposalDataSource.getProposals({
      questionaryIds: [proposalQuestionary.questionaryId],
    });

    if (!result) {
      return false;
    }
    const proposal = result.proposals[0];
    if (!proposal) {
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
        questionaryDataSource
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
