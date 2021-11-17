import { logger } from '@esss-swap/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { UserWithRole } from '../../models/User';
import { ProposalAuthorization } from '../ProposalAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class ProposalQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private userAuth = container.resolve(UserAuthorization);
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
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

    return this.proposalAuth.hasReadRights(agent, proposal);
  }
}
