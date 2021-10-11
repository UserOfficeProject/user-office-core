import { logger } from '@esss-swap/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { TemplateGroupId } from '../models/Template';
import { User, UserWithRole } from '../models/User';
import { VisitDataSource } from './../datasources/VisitDataSource';
import { UserAuthorization } from './UserAuthorization';
import { VisitAuthorization } from './VisitAuthorization';

export interface QuestionaryAuthorizer {
  hasReadRights(agent: User | null, questionaryId: number): Promise<boolean>;
  hasWriteRights(agent: User | null, questionaryId: number): Promise<boolean>;
}

// TODO move QuestionaryAuthorizers to separate files
@injectable()
export class ProposalQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource
  ) {}
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const proposal = (
      await this.proposalDataSource.getProposals({
        questionaryIds: [questionaryId],
      })
    ).proposals[0];

    if (!proposal) {
      // there is no proposal associated with the questionary
      logger.logError(
        'Authorizer failed unexpectedly, because is no proposal is associated with the questionary',
        { agent, questionaryId }
      );

      return false;
    }

    const hasActiveCall = await this.callDataSource.checkActiveCall(
      proposal.callId
    );

    if (!hasActiveCall) {
      return false;
    }

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

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const queryResult = await this.sampleDataSource.getSamples({
      filter: { questionaryIds: [questionaryId] },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const sample = queryResult[0];

    const proposal = await this.proposalDataSource.get(sample.proposalPk);

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
  implements QuestionaryAuthorizer
{
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

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const queryResult = await this.shipmentDataSource.getShipments({
      filter: { questionaryIds: [questionaryId] },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const shipment = queryResult[0];

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);

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
class VisitQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.VisitAuthorization)
    private visitAuth: VisitAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}
  /**
   * Visitor has read rights on his and other visitor questionaries
   * that ar in the same visit
   * */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (await this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const registration = (
      await this.visitDataSource.getRegistrations({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!registration) {
      return false;
    }

    return this.visitAuth.hasReadRights(agent, registration.visitId);
  }

  /**
   * Visitor has write rights only his questionary
   * */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (await this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const registration = (
      await this.visitDataSource.getRegistrations({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!registration) {
      return false;
    }

    if (registration.isRegistrationSubmitted) {
      logger.logError('User tried to update visit that is already submitted', {
        agent,
        questionaryId,
        registration,
      });

      return false;
    }

    return registration.userId === agent.id;
  }
}

@injectable()
export class ProposalEsiQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    private proposalEsiDataSource: ProposalEsiDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,

    private proposalQuestionaryAuth: ProposalQuestionaryAuthorizer = container.resolve(
      ProposalQuestionaryAuthorizer
    )
  ) {}

  async getProposalPk(esiQuestionaryId: number): Promise<number | null> {
    const esi = await this.proposalEsiDataSource.getEsis({
      questionaryId: esiQuestionaryId,
    });
    if (esi.length !== 1) {
      return null;
    }
    const visit = await this.visitDataSource.getVisit(esi[0].visitId);
    if (!visit) {
      return null;
    }

    return visit.proposalPk;
  }
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const proposalPk = await this.getProposalPk(questionaryId);
    if (proposalPk === null) {
      return false;
    }

    return this.proposalQuestionaryAuth.hasReadRights(agent, proposalPk);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const proposalPk = await this.getProposalPk(questionaryId);
    if (proposalPk === null) {
      return false;
    }

    return this.proposalQuestionaryAuth.hasWriteRights(agent, proposalPk);
  }
}

@injectable()
export class SampleEsiQuestionaryAuthorizer implements QuestionaryAuthorizer {
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    //  TODO implement this
    return true;
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    //  TODO implement this
    return true;
  }
}

@injectable()
class GenericTemplateQuestionaryAuthorizer implements QuestionaryAuthorizer {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
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

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const queryResult =
      await this.genericTemplateDataSource.getGenericTemplates({
        filter: { questionaryIds: [questionaryId] },
      });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one generic template with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const genericTemplate = queryResult[0];

    const proposal = await this.proposalDataSource.get(
      genericTemplate.proposalPk
    );

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
  private authorizers = new Map<TemplateGroupId, QuestionaryAuthorizer>();
  // TODO obtain authorizer from QuestionaryDefinition
  constructor(
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource
  ) {
    this.authorizers.set(
      TemplateGroupId.PROPOSAL,
      container.resolve(ProposalQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SAMPLE,
      container.resolve(SampleDeclarationQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SHIPMENT,
      container.resolve(ShipmentDeclarationQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.VISIT_REGISTRATION,
      container.resolve(VisitQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.PROPOSAL_ESI,
      container.resolve(ProposalEsiQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SAMPLE_ESI,
      container.resolve(SampleEsiQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.GENERIC_TEMPLATE,
      container.resolve(GenericTemplateQuestionaryAuthorizer)
    );
  }

  private async getTemplateGroupIdForQuestionary(questionaryId: number) {
    const templateId = (
      await this.questionaryDataSource.getQuestionary(questionaryId)
    )?.templateId;
    if (!templateId) return null;

    const groupId = (await this.templateDataSource.getTemplate(templateId))
      ?.groupId;
    if (!groupId) return null;

    return groupId;
  }

  private async getAuthorizer(questionaryId: number) {
    const categoryId = await this.getTemplateGroupIdForQuestionary(
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
