import { GraphQLError } from 'graphql';

import { ProposalInternalComment } from '../../models/ProposalInternalComment';
import { CreateProposalInternalCommentArgs } from '../../resolvers/types/ProposalInternalComment';
import { ProposalRejectionCommentsDataSource } from '../ProposalRejectionCommentsDataSource';
import database from './database';
import {
  createProposalInternalCommentObject,
  ProposalInternalCommentRecord,
} from './records';
export default class PostgresProposalRejectionCommentsDataSource
  implements ProposalRejectionCommentsDataSource
{
  async create(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment> {
    try {
      await database('proposal_rejection_comments')
        .where('proposal_pk', args.proposalPk)
        .del();
      const [proposalRejectionComment]: ProposalInternalCommentRecord[] =
        await database('proposal_rejection_comments')
          .insert({
            proposal_pk: args.proposalPk,
            comment: args.comment,
          })
          .returning('*');
      if (!proposalRejectionComment) {
        throw new GraphQLError(
          'Proposal rejection comment could not be created'
        );
      }

      return createProposalInternalCommentObject(proposalRejectionComment);
    } catch (error) {
      throw new GraphQLError('Error while creating proposal rejection comment');
    }
  }
  async getProposalRejectionComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null> {
    return await database
      .select<ProposalInternalCommentRecord>()
      .from('proposal_rejection_comments')
      .where('proposal_pk', proposalPk)
      .first()
      .then((comment) =>
        comment ? createProposalInternalCommentObject(comment) : null
      );
  }
}
