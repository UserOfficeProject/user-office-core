import { ProposalInternalComment } from '../models/ProposalInternalComment';
import {
  CreateProposalInternalCommentArgs,
  UpdateProposalInternalCommentArgs,
} from '../resolvers/types/ProposalInternalComment';

export interface ProposalInternalCommentsDataSource {
  createInternalComment(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment>;

  updateInternalComment(
    args: UpdateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment | null>;
  getProposalInternalComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null>;

  createRejectionComment(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment>;

  getProposalRejectionComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null>;
}
