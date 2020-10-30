import { ProposalStatus } from './ProposalStatus';

export class ProposalWorkflowConnection {
  constructor(
    public id: number,
    public sortOrder: number,
    public proposalWorkflowId: number,
    public proposalStatusId: number,
    public proposalStatus: ProposalStatus,
    public nextProposalStatusId: number | null,
    public prevProposalStatusId: number | null,
    public droppableGroupId: string,
    public parentDroppableGroupId: string | null
  ) {}
}
