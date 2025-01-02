import { GraphQLError } from 'graphql';

import { ProposalInternalComment } from '../../models/ProposalInternalComment';
import {
  CreateProposalInternalCommentArgs,
  UpdateProposalInternalCommentArgs,
} from '../../resolvers/types/ProposalInternalComment';
import { ProposalInternalCommentsDataSource } from '../ProposalInternalCommentsDataSource';
import database from './database';
import {
  createProposalInternalCommentObject,
  ProposalInternalCommentRecord,
} from './records';
export default class PostgresProposalInternalCommentsDataSource
  implements ProposalInternalCommentsDataSource
{
  async create(
    args: CreateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment> {
    try {
      const [proposalInternalComment]: ProposalInternalCommentRecord[] =
        await database('proposal_internal_comments')
          .insert({
            proposal_pk: args.proposalPk,
            comment: args.comment,
          })
          .returning('*');
      if (!proposalInternalComment) {
        throw new GraphQLError(
          'Proposal internal comment could not be created'
        );
      }

      return createProposalInternalCommentObject(proposalInternalComment);
    } catch (error) {
      throw new GraphQLError('Error while creating proposal internal comment');
    }
  }
  async update(
    args: UpdateProposalInternalCommentArgs
  ): Promise<ProposalInternalComment> {
    try {
      const [proposalInternalComment]: ProposalInternalCommentRecord[] =
        await database('proposal_internal_comments')
          .update({
            comment: args.comment,
          })
          .where({ comment_id: args.commentId })
          .returning('*');
      if (!proposalInternalComment) {
        throw new GraphQLError(
          `Proposal internal comment not be updated id: ${args.commentId}`
        );
      }

      return createProposalInternalCommentObject(proposalInternalComment);
    } catch (error) {
      throw new GraphQLError(
        `Error while updating proposal internal comment id: ${args.commentId}`
      );
    }
  }

  async delete(commentId: number): Promise<ProposalInternalComment> {
    try {
      const [proposalInternalComment]: ProposalInternalCommentRecord[] =
        await database('proposal_internal_comments')
          .where({ comment_id: commentId })
          .delete()
          .returning('*');
      if (!proposalInternalComment) {
        throw new GraphQLError(
          `Proposal internal comment not be delete id: ${commentId}`
        );
      }

      return createProposalInternalCommentObject(proposalInternalComment);
    } catch (error) {
      throw new GraphQLError(
        `Error deleting proposal internal comment id: ${commentId}`
      );
    }
  }
  async getProposalInternalComment(
    proposalPk: number
  ): Promise<ProposalInternalComment | null> {
    return await database
      .select<ProposalInternalCommentRecord>()
      .from('proposal_internal_comments')
      .where('proposal_pk', proposalPk)
      .first()
      .then((comment) =>
        comment ? createProposalInternalCommentObject(comment) : null
      );
  }
}
