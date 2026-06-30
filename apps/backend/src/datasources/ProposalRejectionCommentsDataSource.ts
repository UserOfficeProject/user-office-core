import { ProposalInternalComment } from '../models/ProposalInternalComment';
import { CreateProposalInternalCommentArgs } from '../resolvers/types/ProposalInternalComment';

export interface ProposalRejectionCommentsDataSource {
  create(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment>;

  getProposalRejectionComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null>;
}
