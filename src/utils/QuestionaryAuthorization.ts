import { logger } from '@esss-swap/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { TemplateCategoryId } from '../models/Template';
import { User, UserWithRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

interface QuestionaryAuthorizer {
  hasReadRights(agent: User | null, questionaryId: number): Promise<boolean>;
  hasWriteRights(agent: User | null, questionaryId: number): Promise<boolean>;
}

@injectable()
export class ProposalQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
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

    const proposal = (
      await this.proposalDataSource.getProposals({
        questionaryIds: [questionaryId],
      })
    ).proposals[0];

    return this.userAuth.hasAccessRights(agent, proposal);
  }
}

@injectable()
class SampleDeclarationQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
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

    if (await this.userAuthorization.isUserOfficer(agent)) {
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

    const proposal = await this.proposalDataSource.get(sample.proposalId);

    if (!proposal) {
      logger.logError('Could not find proposal for questionary', {
        questionaryId,
      });

      return false;
    }

    return this.userAuthorization.hasAccessRights(agent, proposal);
  }
}

@injectable()
class ShipmentDeclarationQuestionaryAuthorizer
  implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
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

    if (await this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const queryResult = await this.shipmentDataSource.getAll({
      filter: { questionaryId },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const shipment = queryResult[0];

    const proposal = await this.proposalDataSource.get(shipment.proposalId);

    if (!proposal) {
      logger.logError('Could not find proposal for questionary', {
        questionaryId,
      });

      return false;
    }

    return this.userAuthorization.hasAccessRights(agent, proposal);
  }
}

@injectable()
export class QuestionaryAuthorization {
  private authorizers = new Map<number, QuestionaryAuthorizer>();
  constructor(
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource
  ) {
    this.authorizers.set(
      TemplateCategoryId.PROPOSAL_QUESTIONARY,
      container.resolve(ProposalQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateCategoryId.SAMPLE_DECLARATION,
      container.resolve(SampleDeclarationQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateCategoryId.SHIPMENT_DECLARATION,
      container.resolve(ShipmentDeclarationQuestionaryAuthorizer)
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
