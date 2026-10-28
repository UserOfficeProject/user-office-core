import { ProposalInternalComment } from '../../models/ProposalInternalComment';
import {
  CreateProposalInternalCommentArgs,
  UpdateProposalInternalCommentArgs,
} from '../../resolvers/types/ProposalInternalComment';
import { ProposalInternalCommentsDataSource } from '../ProposalInternalCommentsDataSource';

export const dummyProposalInternalCommentOne = new ProposalInternalComment(
  1,
  1,
  'Dummy comment'
);

export const dummyProposalInternalCommentTwo = new ProposalInternalComment(
  2,
  2,
  'Dummy comment two'
);

export const dummyProposalInternalComments: ProposalInternalComment[] = [
  dummyProposalInternalCommentOne,
  dummyProposalInternalCommentTwo,
];
export class PostgresProposalInternalCommentsDataSourceMock
  implements ProposalInternalCommentsDataSource
{
  async createInternalComment(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment> {
    return {
      ...args,
    } as ProposalInternalComment;
  }

  async updateInternalComment(
    args: UpdateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment | null> {
    return {
      ...dummyProposalInternalCommentOne,
      ...args,
    } as ProposalInternalComment;
  }
  async createRejectionComment(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment> {
    return {
      ...args,
    } as ProposalInternalComment;
  }

  async getProposalRejectionComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null> {
    return (
      dummyProposalInternalComments.find(
        (comment) => comment.proposalPk === proposalPk
      ) || null
    );
  }

  async getProposalInternalComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null> {
    return (
      dummyProposalInternalComments.find(
        (comment) => comment.proposalPk === proposalPk
      ) || null
    );
  }
}
