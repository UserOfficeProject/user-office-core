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

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    let riskAssessment: RiskAssessment;
    if (typeof riskAssessmentOrId === 'number') {
      const riskAssessmentFromDb = await this.riskAssessmentDataSource.getRiskAssessment(
        riskAssessmentOrId
      );
      if (!riskAssessmentFromDb) {
        return false;
      }
      riskAssessment = riskAssessmentFromDb;
    } else {
      riskAssessment = riskAssessmentOrId;
    }

    if (!riskAssessment) {
      return false;
    }

    return (
      riskAssessment.creatorUserId === agent.id ||
      (await this.userAuthorization.isMemberOfProposal(
        agent,
        riskAssessment.proposalPk
      )) ||
      (await this.userAuthorization.isVisitorOfProposal(
        agent,
        riskAssessment.proposalPk
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

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    let riskAssessment: RiskAssessment;
    if (typeof riskAssessmentOrId === 'number') {
      const riskAssessmentFromDb = await this.riskAssessmentDataSource.getRiskAssessment(
        riskAssessmentOrId
      );
      if (!riskAssessmentFromDb) {
        return false;
      }
      riskAssessment = riskAssessmentFromDb;
    } else {
      riskAssessment = riskAssessmentOrId;
    }

    const proposal = await this.proposalDataSource.get(
      riskAssessment.proposalPk
    );

    if (this.userAuthorization.isMemberOfProposal(agent, proposal)) {
      if (riskAssessment.status === RiskAssessmentStatus.SUBMITTED) {
        logger.logError('User tried to change submitted risk assessment', {
          agent,
          riskAssessment,
        });

        return false;
      }

      return true;
    }

    logger.logError('User tried to change visit that he is not a member of', {
      agent,
      riskAssessment,
    });

    return false;
  }
}
