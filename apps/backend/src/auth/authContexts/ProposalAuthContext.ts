import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { Proposal } from '../../models/Proposal';

export interface ProposalContextData
  extends Partial<Pick<Proposal, 'title' | 'submitted'>> {
  type: 'proposal';
  primaryKey: number;
  title: string;
  proposalId: string;
  submitted?: boolean;
}

export const PROPOSAL_AUTH_UI_ATTRIBUTES: Array<keyof ProposalContextData> = [
  'title',
  'proposalId',
  'submitted',
];

@injectable()
export class ProposalAuthContext {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource
  ) {}

  async fetchContextForProposals(
    proposalPks: number[]
  ): Promise<Map<number, ProposalContextData>> {
    const proposals = await this.proposalDataSource.getProposals({
      proposalPks: proposalPks,
    });

    const contextMap = new Map<number, ProposalContextData>();

    for (const proposal of proposals.proposals) {
      const proposalCtx: ProposalContextData = {
        type: 'proposal',
        primaryKey: proposal.primaryKey,
        proposalId: proposal.proposalId,
        title: proposal.title,
        submitted: proposal.submitted,
      };

      contextMap.set(proposal.primaryKey, proposalCtx);
    }

    return contextMap;
  }
}
