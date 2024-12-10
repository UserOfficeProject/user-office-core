import { ProposalInternalComment } from '../models/ProposalInternalComment';
import {
  CreateProposalInternalCommentArgs,
  UpdateProposalInternalCommentArgs,
} from '../resolvers/types/ProposalInternalComment';

export interface ProposalInternalCommentsDataSource {
  create(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment>;

  update(
    args: UpdateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment | null>;
  getProposalInternalComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null>;
}
