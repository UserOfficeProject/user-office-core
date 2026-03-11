import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { StatusDataSource } from '../../datasources/StatusDataSource';
import { Proposal } from '../../models/Proposal';
import { WorkflowType } from '../../models/Workflow';

export interface ProposalContextData
  extends Partial<
    Pick<Proposal, 'title' | 'submitted' | 'callId' | 'proposerId'>
  > {
  type: 'proposal';
  primaryKey: number;
  title: string;
  proposalId: string;
  submitted: boolean;
  callId: number;
  proposerId: number;
  statusShortCode: string;
}

export const PROPOSAL_AUTH_UI_ATTRIBUTES: Array<keyof ProposalContextData> = [
  'title',
  'submitted',
  'statusShortCode',
  'proposerId',
];

@injectable()
export class ProposalAuthContext {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.StatusDataSource)
    private statusDataSource: StatusDataSource
  ) {}

  async fetchProposalsContext(
    proposalPks: number[]
  ): Promise<Map<number, ProposalContextData>> {
    const [proposals, allStatuses] = await Promise.all([
      this.proposalDataSource.getProposals({
        proposalPks: proposalPks,
      }),
      this.statusDataSource.getAllStatuses(WorkflowType.PROPOSAL),
    ]);

    const contextMap = new Map<number, ProposalContextData>();

    for (const proposal of proposals.proposals) {
      const proposalCtx: ProposalContextData = {
        type: 'proposal',
        primaryKey: proposal.primaryKey,
        proposalId: proposal.proposalId,
        title: proposal.title,
        submitted: proposal.submitted,
        callId: proposal.callId,
        proposerId: proposal.proposerId,
        statusShortCode:
          allStatuses.find((status) => status.id === proposal.statusId)
            ?.shortCode || '',
      };

      contextMap.set(proposal.primaryKey, proposalCtx);
    }

    return contextMap;
  }
}
