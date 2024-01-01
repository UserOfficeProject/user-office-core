import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import {
  Fap,
  FapAssignment,
  FapReviewer,
  FapProposal,
  FapProposalWithReviewGradesAndRanking,
} from '../../models/Fap';
import { FapMeetingDecision } from '../../models/FapMeetingDecision';
import { ProposalEndStatus, ProposalPks } from '../../models/Proposal';
import { Review, ReviewStatus } from '../../models/Review';
import { Role, Roles } from '../../models/Role';
import { BasicUserDetails, UserRole } from '../../models/User';
import {
  UpdateMemberFapArgs,
  AssignReviewersToFapArgs,
  AssignChairOrSecretaryToFapInput,
} from '../../resolvers/mutations/AssignMembersToFapMutation';
import { AssignProposalsToFapArgs } from '../../resolvers/mutations/AssignProposalsToFapMutation';
import { SaveFapMeetingDecisionInput } from '../../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../../resolvers/queries/FapsQuery';
import { FapDataSource } from '../FapDataSource';
import database from './database';
import {
  FapRecord,
  FapAssignmentRecord,
  RoleRecord,
  FapProposalRecord,
  ReviewRecord,
  FapReviewerRecord,
  createFapObject,
  createFapAssignmentObject,
  createFapProposalObject,
  createFapReviewerObject,
  createFapMeetingDecisionObject,
  createRoleObject,
  RoleUserRecord,
  FapMeetingDecisionRecord,
  FapProposalWithReviewGradesAndRankingRecord,
  createReviewObject,
  UserRecord,
  createBasicUserObject,
  InstitutionRecord,
} from './records';

export default class PostgresFapDataSource implements FapDataSource {
  async delete(id: number): Promise<Fap> {
    return database
      .where('faps.fap_id', id)
      .del()
      .from('faps')
      .returning('*')
      .then((fap: FapRecord[]) => {
        if (fap === undefined || fap.length !== 1) {
          throw new GraphQLError(`Could not delete fap with id:${id}`);
        }

        return createFapObject(fap[0]);
      });
  }
  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    gradeGuide: string,
    customGradeGuide: boolean | null,
    active: boolean
  ) {
    return database
      .insert(
        {
          code: code,
          description: description,
          number_ratings_required: numberRatingsRequired,
          grade_guide: gradeGuide,
          custom_grade_guide: customGradeGuide,
          active: active,
        },
        ['*']
      )
      .from('faps')
      .then((resultSet: FapRecord[]) => createFapObject(resultSet[0]));
  }

  async update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    gradeGuide: string,
    customGradeGuide: boolean,
    active: boolean
  ) {
    return database
      .update(
        {
          code,
          description,
          number_ratings_required: numberRatingsRequired,
          grade_guide: gradeGuide,
          custom_grade_guide: customGradeGuide,
          active,
        },
        ['*']
      )
      .from('faps')
      .where('fap_id', id)
      .then((records: FapRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Fap not found ${id}`);
        }

        return createFapObject(records[0]);
      });
  }

  async getFap(id: number) {
    return database
      .select()
      .from('faps')
      .where('fap_id', id)
      .first()
      .then((fap: FapRecord) => {
        return fap ? createFapObject(fap) : null;
      });
  }

  async getUserFapsByRoleAndFapId(
    userId: number,
    role: Role,
    fapId?: number
  ): Promise<Fap[]> {
    const fapRecords = await database<FapRecord[]>('faps')
      .select<FapRecord[]>('faps.*')
      .leftJoin('fap_reviewers', 'fap_reviewers.fap_id', '=', 'faps.fap_id')
      .where((qb) => {
        if (fapId) {
          qb.where('faps.fap_id', fapId);
        }
        if (role.shortCode === Roles.FAP_CHAIR) {
          qb.where('fap_chair_user_id', userId);
        } else if (role.shortCode === Roles.FAP_SECRETARY) {
          qb.where('fap_secretary_user_id', userId);
        } else {
          qb.where('fap_reviewers.user_id', userId);
        }
      });

    return fapRecords.map(createFapObject);
  }

  async getFapsByCallId(callId: number): Promise<Fap[]> {
    return database
      .select('*')
      .from('faps as s')
      .join('call_has_faps as chs', {
        's.fap_id': 'chs.fap_id',
      })
      .where('chs.call_id', callId)
      .distinct('s.fap_id')
      .then((faps: FapRecord[]) => {
        return faps.map(createFapObject);
      });
  }

  async getUserFaps(userId: number, role: Role): Promise<Fap[]> {
    const qb = database<FapRecord>('faps').select<FapRecord[]>('faps.*');

    if (role.shortCode === Roles.FAP_CHAIR) {
      qb.where('fap_chair_user_id', userId);
    } else if (role.shortCode === Roles.FAP_SECRETARY) {
      qb.where('fap_secretary_user_id', userId);
    } else if (role.shortCode === Roles.FAP_REVIEWER) {
      qb.join(
        'fap_reviewers',
        'fap_reviewers.fap_id',
        '=',
        'faps.fap_id'
      ).where('fap_reviewers.user_id', userId);
    } else {
      logger.logWarn('User tried to list its Faps but has invalid role', {
        userId,
        role,
      });

      return [];
    }

    const fapRecords = await qb;

    return fapRecords.map(createFapObject);
  }

  async getFaps({
    active,
    callIds,
    filter,
    first,
    offset,
  }: FapsFilter): Promise<{ totalCount: number; faps: Fap[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('faps')
      .orderBy('faps.fap_id', 'desc')
      .modify((query) => {
        if (filter) {
          query
            .where('code', 'ilike', `%${filter}%`)
            .orWhere('description', 'ilike', `%${filter}%`);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
        if (active !== undefined) {
          query.where('active', active);
        }
        if (callIds?.length) {
          query
            .leftJoin('call_has_faps as chs', 'chs.fap_id', 'faps.fap_id')
            .whereIn('chs.call_id', callIds);
        }
      })
      .then((allFaps: FapRecord[]) => {
        const faps = allFaps.map((fap) => createFapObject(fap));

        return {
          totalCount: allFaps[0] ? allFaps[0].full_count : 0,
          faps,
        };
      });
  }

  async getFapProposalAssignments(
    fapId: number,
    proposalPk: number,
    reviewerId: number | null
  ): Promise<FapAssignment[]> {
    const fapAssignments: FapAssignmentRecord[] = await database
      .from('fap_assignments')
      .modify((query) => {
        if (reviewerId !== null) {
          query.where('fap_member_user_id', reviewerId);
        }
      })
      .where('fap_id', fapId)
      .andWhere('proposal_pk', proposalPk);

    return fapAssignments.map((fapAssignment) =>
      createFapAssignmentObject(fapAssignment)
    );
  }

  async getFapProposals(
    fapId: number,
    callId: number | null
  ): Promise<FapProposal[]> {
    const fapProposals: FapProposalRecord[] = await database
      .select(['sp.*'])
      .from('fap_proposals as sp')
      .modify((query) => {
        query
          .join('proposals as p', {
            'p.proposal_pk': 'sp.proposal_pk',
          })
          .join('proposal_statuses as ps', {
            'p.status_id': 'ps.proposal_status_id',
          })
          .where(function () {
            this.where('ps.name', 'ilike', 'FAP_%');
          });

        if (callId) {
          query.andWhere('p.call_id', callId);
        }
      })
      .where('sp.fap_id', fapId);

    return fapProposals.map((fapProposal) =>
      createFapProposalObject(fapProposal)
    );
  }

  async getFapUsersByProposalPkAndCallId(
    proposalPk: number,
    callId: number
  ): Promise<BasicUserDetails[]> {
    const fapProposalReviewers: Array<UserRecord & InstitutionRecord> =
      await database
        .select(['users.*, institutions.*'])
        .from('fap_reviews as sr')
        .join('fap_proposals as sp', {
          'sr.proposal_pk': 'sp.proposal_pk',
          'sr.fap_id': 'sp.fap_id',
        })
        .join('users', {
          'users.user_id': 'sr.user_id',
        })
        .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
        .where('sp.proposal_pk', proposalPk)
        .andWhere('sp.call_id', callId);

    return fapProposalReviewers.map((fapProposalReviewer) =>
      createBasicUserObject(fapProposalReviewer)
    );
  }

  async getFapProposalCount(fapId: number): Promise<number> {
    return database('fap_proposals')
      .count('fap_id')
      .where('fap_id', fapId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async getFapReviewerProposalCount(reviewerId: number): Promise<number> {
    return database('fap_reviews')
      .count('user_id')
      .where('user_id', reviewerId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async getFapReviewsByCallAndStatus(
    callIds: number[],
    status: ReviewStatus
  ): Promise<Review[]> {
    const fapReviews: ReviewRecord[] = await database
      .select(['sr.*'])
      .from('fap_reviews as sr')
      .join('fap_proposals as sp', {
        'sp.proposal_pk': 'sr.proposal_pk',
      })
      .whereIn('sp.call_id', callIds)
      .andWhere('sr.status', status)
      .andWhere('sr.notification_email_sent', false);

    return fapReviews.map((fapReview) => createReviewObject(fapReview));
  }

  async setFapReviewNotificationEmailSent(
    reviewId: number,
    userId: number,
    proposalPk: number
  ): Promise<boolean> {
    return database
      .update(
        {
          notification_email_sent: true,
        },
        ['*']
      )
      .from('fap_reviews')
      .where('review_id', reviewId)
      .andWhere('user_id', userId)
      .andWhere('proposal_pk', proposalPk)
      .then((records: ReviewRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Fap review not found ${reviewId}`);
        }

        return true;
      });
  }

  async getFapProposal(
    fapId: number,
    proposalPk: number
  ): Promise<FapProposal | null> {
    const fapProposal: FapProposalRecord = await database
      .select(['sp.*'])
      .from('fap_proposals as sp')
      .join('proposals as p', {
        'p.proposal_pk': 'sp.proposal_pk',
      })
      .where('sp.fap_id', fapId)
      .where('sp.proposal_pk', proposalPk)
      .first();

    return fapProposal ? createFapProposalObject(fapProposal) : null;
  }

  async getFapProposalsByInstrument(
    fapId: number,
    instrumentId: number,
    callId: number
  ): Promise<FapProposal[]> {
    const fapProposals: FapProposalRecord[] = await database
      .select([
        'sp.proposal_pk',
        'sp.fap_id',
        'sp.fap_time_allocation',
        'ihp.submitted as instrument_submitted',
      ])
      .from('fap_proposals as sp')
      .join('instrument_has_proposals as ihp', {
        'sp.proposal_pk': 'ihp.proposal_pk',
      })
      .join('proposals as p', {
        'p.proposal_pk': 'sp.proposal_pk',
        'p.call_id': callId,
      })
      .join('proposal_statuses as ps', {
        'p.status_id': 'ps.proposal_status_id',
      })
      .where('sp.fap_id', fapId)
      .andWhere('ihp.instrument_id', instrumentId);

    return fapProposals.map((fapProposal) =>
      createFapProposalObject(fapProposal)
    );
  }

  async getMembers(fapId: number): Promise<FapReviewer[]> {
    const reviewerRecords: FapReviewerRecord[] = await database
      .from('fap_reviewers')
      .where('fap_id', fapId);

    const fap = await this.getFap(fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    fap.fapChairUserId !== null &&
      reviewerRecords.unshift({
        user_id: fap.fapChairUserId,
        fap_id: fapId,
      });

    fap.fapSecretaryUserId !== null &&
      reviewerRecords.unshift({
        user_id: fap.fapSecretaryUserId,
        fap_id: fapId,
      });

    return reviewerRecords.map(createFapReviewerObject);
  }

  async getReviewers(fapId: number): Promise<FapReviewer[]> {
    const reviewerRecords: FapReviewerRecord[] = await database
      .from('fap_reviewers')
      .where('fap_id', fapId);

    return reviewerRecords.map(createFapReviewerObject);
  }

  async getFapUserRole(userId: number, fapId: number): Promise<Role | null> {
    const fap = await this.getFap(fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    let shortCode: Roles;

    if (fap.fapChairUserId === userId) {
      shortCode = Roles.FAP_CHAIR;
    } else if (fap.fapSecretaryUserId === userId) {
      shortCode = Roles.FAP_SECRETARY;
    } else {
      shortCode = Roles.FAP_REVIEWER;
    }

    const roleRecord = await database<RoleRecord>('roles')
      .where('short_code', shortCode)
      .first();

    if (!roleRecord) {
      throw new GraphQLError(
        `Role with short code ${shortCode} does not exist`
      );
    }

    if (shortCode === Roles.FAP_REVIEWER) {
      const fapReviewerRecord = await database<FapReviewerRecord>(
        'fap_reviewers'
      )
        .select('*')
        .where('user_id', userId)
        .where('fap_id', fapId)
        .first();

      if (!fapReviewerRecord) {
        return null;
      }
    }

    return createRoleObject(roleRecord);
  }

  async getFapByProposalPk(proposalPk: number): Promise<Fap | null> {
    return database
      .select()
      .from('faps as s')
      .join('fap_proposals as sp', { 's.fap_id': 'sp.fap_id' })
      .where('sp.proposal_pk', proposalPk)
      .first()
      .then((fap: FapRecord) => {
        if (fap) {
          return createFapObject(fap);
        }

        return null;
      });
  }

  async getFapsByProposalPks(proposalPks: number[]): Promise<FapProposal[]> {
    const fapProposal: FapProposalRecord[] = await database
      .select('*')
      .from('fap_proposals')
      .whereIn('proposal_pk', proposalPks);

    return fapProposal.map((fapProposal) =>
      createFapProposalObject(fapProposal)
    );
  }

  async assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap> {
    await database.transaction(async (trx) => {
      const isChairAssignment = args.roleId === UserRole.FAP_CHAIR;

      await trx<FapRecord>('faps')
        .update({
          [isChairAssignment ? 'fap_chair_user_id' : 'fap_secretary_user_id']:
            args.userId,
        })
        .where('fap_id', args.fapId);

      const shortCode = isChairAssignment
        ? Roles.FAP_CHAIR
        : Roles.FAP_SECRETARY;
      const roleRecord = await trx<RoleRecord>('roles')
        .select('*')
        .where('short_code', shortCode)
        .first();

      if (!roleRecord) {
        throw new GraphQLError(
          `Could not find role with short code ${shortCode}`
        );
      }

      await trx<RoleUserRecord>('role_user')
        .insert({
          role_id: roleRecord.role_id,
          user_id: args.userId,
        })
        .onConflict(['role_id', 'user_id'])
        .ignore();
    });

    const fapUpdated = await this.getFap(args.fapId);

    if (fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${args.fapId}`);
  }

  async assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap> {
    await database<FapReviewerRecord>('fap_reviewers').insert(
      args.memberIds.map((userId) => ({
        fap_id: args.fapId,
        user_id: userId,
      }))
    );

    const fapUpdated = await this.getFap(args.fapId);

    if (fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${args.fapId}`);
  }

  async removeMemberFromFap(
    args: UpdateMemberFapArgs,
    isMemberChairOrSecretaryOfFap: boolean
  ) {
    if (isMemberChairOrSecretaryOfFap) {
      const field =
        args.roleId === UserRole.FAP_CHAIR
          ? 'fap_chair_user_id'
          : 'fap_secretary_user_id';

      const updateResult = await database<FapRecord>('faps')
        .update({
          [field]: null,
        })
        .where('fap_id', args.fapId);

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove fap member ${args.memberId} (${field}), fap id ${args.fapId}`
        );
      }
    } else {
      const updateResult = await database<FapReviewerRecord>('fap_reviewers')
        .where('fap_id', args.fapId)
        .where('user_id', args.memberId)
        .del();

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove fap member ${args.memberId}, fap id ${args.fapId}`
        );
      }
    }

    const fapUpdated = await this.getFap(args.fapId);

    if (fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${args.fapId}`);
  }

  async assignProposalsToFap({ proposals, fapId }: AssignProposalsToFapArgs) {
    const dataToInsert = proposals.map((proposal) => ({
      fap_id: fapId,
      proposal_pk: proposal.primaryKey,
      call_id: proposal.callId,
    }));

    const proposalFapPairs: {
      proposal_pk: number;
      fap_id: number;
    }[] = await database.transaction(async (trx) => {
      try {
        /**
         * NOTE: First delete all connections that should be changed,
         * because currently we only support one proposal to be assigned on one Fap.
         * So we don't end up in a situation that one proposal is assigned to multiple Faps
         * which is not supported scenario by the frontend because it only shows one Fap per proposal.
         */
        await database('fap_proposals')
          .del()
          .whereIn(
            'proposal_pk',
            proposals.map((proposal) => proposal.primaryKey)
          )
          .transacting(trx);

        const result = await database('fap_proposals')
          .insert(dataToInsert)
          .returning(['*'])
          .transacting(trx);

        return await trx.commit(result);
      } catch (error) {
        throw new GraphQLError(
          `Could not assign proposals ${proposals} to Fap with id: ${fapId}`
        );
      }
    });

    const returnedProposalPks = proposalFapPairs.map(
      (proposalFapPair) => proposalFapPair.proposal_pk
    );

    if (proposalFapPairs?.length) {
      /**
       * NOTE: We need to return changed proposalPks because we listen to events and
       * we need to do some changes on proposals based on what is changed.
       */
      return new ProposalPks(returnedProposalPks);
    }

    throw new GraphQLError(
      `Could not assign proposals ${proposals} to Fap with id: ${fapId}`
    );
  }

  async removeProposalsFromFap(proposalPks: number[], fapId: number) {
    await database.transaction(async (trx) => {
      await trx('fap_proposals')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('fap_id', fapId)
        .del();

      await trx('fap_assignments')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('fap_id', fapId)
        .del();

      await trx('fap_reviews')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('fap_id', fapId)
        .del();
    });

    const fapUpdated = await this.getFap(fapId);

    if (!fapUpdated) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    return fapUpdated;
  }

  async assignMemberToFapProposal(
    proposalPk: number,
    fapId: number,
    memberIds: number[]
  ) {
    await database.transaction(async (trx) => {
      await trx<FapAssignmentRecord>('fap_assignments')
        .insert(
          memberIds.map((memberId) => ({
            proposal_pk: proposalPk,
            fap_member_user_id: memberId,
            fap_id: fapId,
          }))
        )
        .returning<FapAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('fap_reviews')
        .insert(
          memberIds.map((memberId) => ({
            user_id: memberId,
            proposal_pk: proposalPk,
            status: ReviewStatus.DRAFT,
            fap_id: fapId,
          }))
        )
        .returning<ReviewRecord[]>(['*']);
    });

    const updatedFap = await this.getFap(fapId);

    if (updatedFap) {
      return updatedFap;
    }

    throw new GraphQLError(`Fap not found ${fapId}`);
  }

  async removeMemberFromFapProposal(
    proposalPk: number,
    fapId: number,
    memberId: number
  ) {
    const memberRemovedFromProposal = await database('fap_assignments')
      .del()
      .where('fap_id', fapId)
      .andWhere('proposal_pk', proposalPk)
      .andWhere('fap_member_user_id', memberId);

    const fapUpdated = await this.getFap(fapId);

    if (memberRemovedFromProposal && fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${fapId}`);
  }

  async updateTimeAllocation(
    fapId: number,
    proposalPk: number,
    fapTimeAllocation: number | null
  ): Promise<FapProposal> {
    const [updatedRecord]: FapProposalRecord[] = await database('fap_proposals')
      .update(
        {
          fap_time_allocation: fapTimeAllocation,
        },
        ['*']
      )
      .where('fap_id', fapId)
      .where('proposal_pk', proposalPk);

    if (!updatedRecord) {
      throw new GraphQLError(
        `Fap proposal not found, fapId: ${fapId}, proposalPk: ${proposalPk}`
      );
    }

    return createFapProposalObject(updatedRecord);
  }

  async isChairOrSecretaryOfFap(
    userId: number,
    fapId: number
  ): Promise<boolean> {
    const record = await database<FapRecord>('faps')
      .select('*')
      .where('fap_id', fapId)
      .where((qb) => {
        qb.where('fap_chair_user_id', userId);
        qb.orWhere('fap_secretary_user_id', userId);
      })
      .first();

    return record !== undefined;
  }

  async isChairOrSecretaryOfProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean> {
    const record = await database<FapRecord>('faps')
      .select<FapRecord>(['faps.*'])
      .join('fap_proposals', 'fap_proposals.fap_id', '=', 'faps.fap_id')
      .where('fap_proposals.proposal_pk', proposalPk)
      .where((qb) => {
        qb.where('fap_chair_user_id', userId);
        qb.orWhere('fap_secretary_user_id', userId);
      })
      .first();

    return record !== undefined;
  }

  async saveFapMeetingDecision(
    saveFapMeetingDecisionInput: SaveFapMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<FapMeetingDecision> {
    const dataToUpsert: {
      proposal_pk: number;
      rank_order?: number;
      comment_for_management?: string;
      comment_for_user?: string;
      recommendation?: ProposalEndStatus;
      submitted?: boolean;
      submitted_by?: number | null;
    } = {
      proposal_pk: saveFapMeetingDecisionInput.proposalPk,
    };

    const updateQuery = [];

    if (submittedBy) {
      dataToUpsert.submitted_by = submittedBy;
      updateQuery.push('submitted_by = EXCLUDED.submitted_by');
    }
    if (saveFapMeetingDecisionInput.rankOrder) {
      dataToUpsert.rank_order = saveFapMeetingDecisionInput.rankOrder;
      updateQuery.push('rank_order = EXCLUDED.rank_order');
    }

    if (saveFapMeetingDecisionInput.commentForManagement) {
      dataToUpsert.comment_for_management =
        saveFapMeetingDecisionInput.commentForManagement;
      updateQuery.push(
        'comment_for_management = EXCLUDED.comment_for_management'
      );
    }

    if (saveFapMeetingDecisionInput.commentForUser) {
      dataToUpsert.comment_for_user =
        saveFapMeetingDecisionInput.commentForUser;
      updateQuery.push('comment_for_user = EXCLUDED.comment_for_user');
    }

    if (saveFapMeetingDecisionInput.recommendation !== undefined) {
      dataToUpsert.recommendation = saveFapMeetingDecisionInput.recommendation;
      updateQuery.push('recommendation = EXCLUDED.recommendation');
    }

    if (saveFapMeetingDecisionInput.submitted !== undefined) {
      dataToUpsert.submitted = saveFapMeetingDecisionInput.submitted;
      updateQuery.push('submitted = EXCLUDED.submitted');
    }

    const [fapMeetingDecisionRecord]: FapMeetingDecisionRecord[] = (
      await database.raw(
        `? ON CONFLICT (proposal_pk)
        DO UPDATE SET
        ${updateQuery.join(',')}
        RETURNING *;`,
        [database('fap_meeting_decisions').insert(dataToUpsert)]
      )
    ).rows;

    if (!fapMeetingDecisionRecord) {
      logger.logError('Could not update/insert fap meeting decision', {
        dataToUpsert,
      });

      throw new GraphQLError('Could not update/insert fap meeting decision');
    }

    return createFapMeetingDecisionObject(fapMeetingDecisionRecord);
  }

  async getProposalsFapMeetingDecisions(
    proposalPks: number[]
  ): Promise<FapMeetingDecision[]> {
    return database
      .select()
      .from('fap_meeting_decisions')
      .whereIn('proposal_pk', proposalPks)
      .then((fapMeetingDecisionRecords: FapMeetingDecisionRecord[]) => {
        if (!fapMeetingDecisionRecords.length) {
          return [];
        }

        return fapMeetingDecisionRecords.map((fapMeetingDecisionRecord) =>
          createFapMeetingDecisionObject(fapMeetingDecisionRecord)
        );
      });
  }

  async getFapProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<FapProposalWithReviewGradesAndRanking[]> {
    return database('fap_proposals as sp')
      .select([
        'sp.proposal_pk',
        database.raw('json_agg(sr.grade) review_grades'),
        'smd.rank_order',
      ])
      .join('fap_meeting_decisions as smd', {
        'smd.proposal_pk': 'sp.proposal_pk',
      })
      .join('fap_reviews as sr', {
        'sr.proposal_pk': 'sp.proposal_pk',
      })
      .whereIn('sp.proposal_pk', proposalPks)
      .groupBy(['sp.proposal_pk', 'smd.rank_order'])
      .then(
        (
          FapProposalWithReviewGradesAndRankingRecords: FapProposalWithReviewGradesAndRankingRecord[]
        ) => {
          const fapProposalWithReviewGradesAndRanking =
            FapProposalWithReviewGradesAndRankingRecords.map(
              (FapProposalWithReviewGradesAndRankingRecord) =>
                new FapProposalWithReviewGradesAndRanking(
                  FapProposalWithReviewGradesAndRankingRecord.proposal_pk,
                  FapProposalWithReviewGradesAndRankingRecord.rank_order,
                  FapProposalWithReviewGradesAndRankingRecord.review_grades
                )
            );

          return fapProposalWithReviewGradesAndRanking;
        }
      );
  }
  async getRelatedUsersOnFap(id: number): Promise<number[]> {
    const relatedFapMembeers = await database
      .select('sr.user_id')
      .distinct()
      .from('faps as s')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.fap_chair_user_id', id); // where the user is a chair
          this.orOnVal('s.fap_secretary_user_id', id); // where the user is the secretary
        });
      }) // this gives a list of proposals that a user is related to
      .join('fap_reviewers as sr', { 'sr.fap_id': 's.fap_id' }); // this gives us all of the associated reviewers

    const relatedFapChairsAndSecs = await database
      .select('s.fap_chair_user_id', 's.fap_secretary_user_id')
      .distinct()
      .from('faps as s')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.fap_chair_user_id', id); // where the user is a chair
          this.orOnVal('s.fap_secretary_user_id', id); // where the user is the secretary
        });
      });

    const relatedUsers = [
      ...relatedFapMembeers.map((r) => r.user_id),
      ...relatedFapChairsAndSecs.map((r) => r.fap_chair_user_id),
      ...relatedFapChairsAndSecs.map((r) => r.fap_secretary_user_id),
    ];

    return relatedUsers;
  }
}
