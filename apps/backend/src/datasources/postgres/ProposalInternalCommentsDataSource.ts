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
  async createInternalComment(
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
  async updateInternalComment(
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
  async createRejectionComment(
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
