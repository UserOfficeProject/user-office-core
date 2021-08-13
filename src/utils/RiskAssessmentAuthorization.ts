import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RiskAssessment, RiskAssessmentStatus } from '../models/RiskAssessment';
import { UserWithRole } from '../models/User';
import { RiskAssessmentDataSource } from './../datasources/RiskAssessmentDataSource';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class RiskAssessmentAuthorization {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.RiskAssessmentDataSource)
    private riskAssessmentDataSource: RiskAssessmentDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  private async resolveRiskAssessment(
    assessmentOrId: RiskAssessment | number
  ): Promise<RiskAssessment | null> {
    let riskAssessment;

    if (typeof assessmentOrId === 'number') {
      riskAssessment = await this.riskAssessmentDataSource.getRiskAssessment(
        assessmentOrId
      );
    } else {
      riskAssessment = assessmentOrId;
    }

    return riskAssessment;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    riskAssessment: RiskAssessment
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    riskAssessmentId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    riskAssessmentOrId: number | RiskAssessment
  ) {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const assessment = await this.resolveRiskAssessment(riskAssessmentOrId);

    if (!assessment) {
      return false;
    }

    /**
     * User has read access for the risk assessment if he is
     * a member of the associated proposal or a visitor
     * */
    return (
      assessment.creatorUserId === agent.id ||
      (await this.userAuthorization.isMemberOfProposal(
        agent,
        assessment.proposalPk
      )) ||
      (await this.userAuthorization.isVisitorOfProposal(
        agent,
        assessment.proposalPk
      ))
    );
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    riskAssessment: RiskAssessment
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    riskAssessmentId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    riskAssessmentOrId: number | RiskAssessment
  ) {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const assessment = await this.resolveRiskAssessment(riskAssessmentOrId);

    if (!assessment) {
      return false;
    }

    /**
     * User has write access for the risk assessment if he is a member
     * of the associated proposal and the assessment is not yet submitted
     * */
    const isMemberOfProposal = await this.userAuthorization.isMemberOfProposal(
      agent,
      assessment.proposalPk
    );
    if (!isMemberOfProposal) {
      logger.logError('User tried to change visit that he is not a member of', {
        agent,
        riskAssessment: assessment,
      });

      return false;
    }

    if (assessment.status === RiskAssessmentStatus.SUBMITTED) {
      logger.logError('User tried to change submitted risk assessment', {
        agent,
        riskAssessment: assessment,
      });

      return false;
    }

    return true;
  }
}
