import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { UserWithRole } from '../../models/User';
import { ProposalAuthorization } from '../ProposalAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class ProposalQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource
  ) {}

  /**
   * Get the proposal from the questionary id
   * @param questionaryId Questionary id
   * @returns The proposal
   */
  async getProposal(questionaryId: number) {
    const proposal = (
      await this.proposalDataSource.getProposals({
        questionaryIds: [questionaryId],
      })
    ).proposals[0];

    return proposal;
  }

  /**
   * Check if the user has read rights on the proposal
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has read rights on the proposal
   */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const proposal = await this.getProposal(questionaryId);

    // Authorizing questionary follows the same rules as proposal
    return this.proposalAuth.hasReadRights(agent, proposal);
  }

  /**
   * Check if the user has write rights on the proposal
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has write rights on the proposal
   */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const proposal = await this.getProposal(questionaryId);

    // Authorizing questionary follows the same rules as proposal
    return this.proposalAuth.hasWriteRights(agent, proposal);
  }
}
