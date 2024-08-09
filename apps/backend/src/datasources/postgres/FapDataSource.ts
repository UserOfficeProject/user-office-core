import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
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
import { RemoveProposalsFromFapsArgs } from '../../resolvers/mutations/AssignProposalsToFapsMutation';
import { SaveFapMeetingDecisionInput } from '../../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../../resolvers/queries/FapsQuery';
import { removeDuplicates } from '../../utils/helperFunctions';
import { CallDataSource } from '../CallDataSource';
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
  FapSecretariesRecord,
  FapChairsRecord,
  InstitutionRecord,
  AssignProposalsToFapsInput,
  CountryRecord,
  FapReviewsRecord,
} from './records';

@injectable()
export default class PostgresFapDataSource implements FapDataSource {
  constructor(
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource
  ) {}

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
    active: boolean,
    files: string
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
          files,
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
      })
      .then((fap) => (fap ? this.getSecretariesAndChairs(fap) : null));
  }

  async getUserFapsByRoleAndFapId(
    userId: number,
    role: Role,
    fapId?: number
  ): Promise<Fap[]> {
    const fapRecords = await database<FapRecord[]>('faps')
      .select<FapRecord[]>('faps.*')
      .leftJoin('fap_reviewers', 'fap_reviewers.fap_id', '=', 'faps.fap_id')
      .leftJoin('fap_secretaries', 'fap_secretaries.fap_id', '=', 'faps.fap_id')
      .leftJoin('fap_chairs', 'fap_chairs.fap_id', '=', 'faps.fap_id')
      .where((qb) => {
        if (fapId) {
          qb.where('faps.fap_id', fapId);
        }
        if (role.shortCode === Roles.FAP_CHAIR) {
          qb.where('fap_chairs.user_id', userId);
        } else if (role.shortCode === Roles.FAP_SECRETARY) {
          qb.where('fap_secretaries.user_id', userId);
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
      })
      .then((faps) => {
        return Promise.all(faps.map(this.getSecretariesAndChairs));
      });
  }

  async getUserFaps(userId: number, role: Role): Promise<Fap[]> {
    const qb = database<FapRecord>('faps').select<FapRecord[]>('faps.*');

    if (role.shortCode === Roles.FAP_CHAIR) {
      qb.join('fap_chairs', 'fap_chairs.fap_id', '=', 'faps.fap_id').where(
        'fap_chairs.user_id',
        userId
      );
    } else if (role.shortCode === Roles.FAP_SECRETARY) {
      qb.join(
        'fap_secretaries',
        'fap_secretaries.fap_id',
        '=',
        'faps.fap_id'
      ).where('fap_secretaries.user_id', userId);
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

    return Promise.all(
      fapRecords.map(createFapObject).map(this.getSecretariesAndChairs)
    );
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
        return Promise.all(
          allFaps.map(createFapObject).map(this.getSecretariesAndChairs)
        ).then((faps) => {
          return {
            totalCount: allFaps[0] ? allFaps[0].full_count : 0,
            faps: faps,
          };
        });
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

  async getAllFapProposalAssignments(
    proposalPk: number
  ): Promise<FapAssignment[]> {
    const fapAssignments: FapAssignmentRecord[] = await database
      .from('fap_assignments')
      .where('proposal_pk', proposalPk);

    return fapAssignments.map((fapAssignment) =>
      createFapAssignmentObject(fapAssignment)
    );
  }

  async getFapProposals(
    fapId: number,
    callId: number | null
  ): Promise<FapProposal[]> {
    const fapProposals: FapProposalRecord[] = await database
      .select(['fp.*'])
      .from('fap_proposals as fp')
      .modify((query) => {
        query
          .join('proposals as p', {
            'p.proposal_pk': 'fp.proposal_pk',
          })
          .join('proposal_statuses as ps', {
            'p.status_id': 'ps.proposal_status_id',
          })
          .where(function () {
            this.where('ps.name', 'ilike', 'FAP_%');
          });

        if (callId) {
          query.andWhere('fp.call_id', callId);
        }
      })
      .where('fp.fap_id', fapId)
      .distinctOn('fp.proposal_pk');

    return fapProposals.map((fapProposal) =>
      createFapProposalObject(fapProposal)
    );
  }

  async getFapUsersByProposalPkAndCallId(
    proposalPk: number,
    callId: number
  ): Promise<BasicUserDetails[]> {
    const fapProposalReviewers: Array<
      UserRecord & InstitutionRecord & CountryRecord
    > = await database
      .select(['users.*', 'institutions.*'])
      .from('fap_reviews as sr')
      .join('fap_proposals as sp', {
        'sr.proposal_pk': 'sp.proposal_pk',
        'sr.fap_id': 'sp.fap_id',
      })
      .join('users', {
        'users.user_id': 'sr.user_id',
      })
      .join('institutions', {
        'users.institution_id': 'institutions.institution_id',
      })
      .where('sp.proposal_pk', proposalPk)
      .andWhere('sp.call_id', callId);

    return fapProposalReviewers.map((fapProposalReviewer) =>
      createBasicUserObject(fapProposalReviewer)
    );
  }

  async getFapProposalCount(fapId: number): Promise<number> {
    return database('fap_proposals as fp')
      .join('proposals as p', { 'p.proposal_pk': 'fp.proposal_pk' })
      .count('fp.fap_id')
      .where('fp.fap_id', fapId)
      .andWhere('p.submitted', true)
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

  async getFapReviewerProposalCountCurrentRound(
    reviewerId: number
  ): Promise<number> {
    const callFilter = {
      isEnded: true,
      isFapReviewEnded: false,
    };

    const callIds = (await this.callDataSource.getCalls(callFilter)).map(
      (call) => call.id
    );

    return await database
      .count('sr.user_id')
      .from('fap_reviews as sr')
      .join('fap_proposals as sp', {
        'sp.proposal_pk': 'sr.proposal_pk',
      })
      .whereIn('sp.call_id', callIds)
      .andWhere('sr.user_id', reviewerId)
      .groupBy('sr.user_id')
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
    proposalPk: number,
    instrumentId?: number
  ): Promise<FapProposal | null> {
    const fapProposal: FapProposalRecord = await database
      .select(['sp.*'])
      .from('fap_proposals as sp')
      .join('proposals as p', {
        'p.proposal_pk': 'sp.proposal_pk',
      })
      .where('sp.fap_id', fapId)
      .andWhere('sp.proposal_pk', proposalPk)
      .modify((query) => {
        if (instrumentId) {
          query.andWhere('sp.instrument_id', instrumentId);
        }
      })
      .first();

    return fapProposal ? createFapProposalObject(fapProposal) : null;
  }

  async getFapProposalsByInstrument(
    instrumentId: number,
    callId: number,
    { fapId, proposalPk }: { fapId?: number; proposalPk?: number }
  ): Promise<FapProposal[]> {
    const fapProposals: FapProposalRecord[] = await database
      .select([
        'fp.proposal_pk',
        'fp.fap_id',
        'fp.fap_time_allocation',
        'fp.fap_meeting_instrument_submitted',
      ])
      .from('fap_proposals as fp')
      .join('proposals as p', {
        'p.proposal_pk': 'fp.proposal_pk',
        'p.call_id': callId,
      })
      .join('proposal_statuses as ps', {
        'p.status_id': 'ps.proposal_status_id',
      })
      .where('fp.instrument_id', instrumentId)
      .modify((query) => {
        if (fapId) {
          query.andWhere('fp.fap_id', fapId);
        }
      })
      .modify((query) => {
        if (proposalPk) {
          query.andWhere('fp.proposal_pk', proposalPk);
        }
      });

    return fapProposals.map((fapProposal) =>
      createFapProposalObject(fapProposal)
    );
  }

  async getMembers(fapId: number): Promise<FapReviewer[]> {
    const reviewerRecords: FapReviewerRecord[] = await database
      .from('fap_reviewers')
      .where('fap_id', fapId);

    const secretaryRecords: FapSecretariesRecord[] = await database
      .from('fap_secretaries')
      .where('fap_id', fapId);

    secretaryRecords.map((secretary) => {
      reviewerRecords.unshift({
        user_id: secretary.user_id,
        fap_id: fapId,
      });
    });

    const chairRecords: FapSecretariesRecord[] = await database
      .from('fap_chairs')
      .where('fap_id', fapId);

    chairRecords.map((chair) => {
      reviewerRecords.unshift({
        user_id: chair.user_id,
        fap_id: fapId,
      });
    });

    const fap = await this.getFap(fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

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
    const fapSecretaries = await database<FapSecretariesRecord>(
      'fap_secretaries'
    )
      .select('user_id')
      .where('fap_id', fapId);
    const fapChairs = await database<FapChairsRecord>('fap_chairs')
      .select('user_id')
      .where('fap_id', fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    let shortCode: Roles;

    if (
      !!fapChairs.find((chair) => {
        chair.user_id === userId;
      })
    ) {
      shortCode = Roles.FAP_CHAIR;
    } else if (
      !!fapSecretaries.find((secretary) => {
        secretary.user_id === userId;
      })
    ) {
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
          return this.getSecretariesAndChairs(createFapObject(fap));
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

  async getFapsByProposalPk(proposalPk: number): Promise<Fap[]> {
    const faps: FapRecord[] = await database
      .select('*')
      .from('faps')
      .join('fap_proposals', 'fap_proposals.fap_id', '=', 'faps.fap_id')
      .where('proposal_pk', proposalPk);

    return faps.map((fap) => createFapObject(fap));
  }

  async assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap> {
    await database.transaction(async (trx) => {
      const isChairAssignment = args.roleId === UserRole.FAP_CHAIR;

      isChairAssignment
        ? await trx<FapChairsRecord>('fap_chairs').insert({
            user_id: args.userId,
            fap_id: args.fapId,
          })
        : await trx<FapSecretariesRecord>('fap_secretaries').insert({
            user_id: args.userId,
            fap_id: args.fapId,
          });

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

  async removeMemberFromFap(args: UpdateMemberFapArgs) {
    let table;

    switch (args.roleId) {
      case UserRole.FAP_CHAIR:
        table = 'fap_chairs';
        break;
      case UserRole.FAP_SECRETARY:
        table = 'fap_secretaries';
        break;
      default:
        table = 'fap_reviewers';
    }

    const updateResult = await database<FapReviewerRecord>(table)
      .where('fap_id', args.fapId)
      .where('user_id', args.memberId)
      .del();

    if (!updateResult) {
      throw new GraphQLError(
        `Failed to remove ${args.memberId} from ${table}, fap id ${args.fapId}`
      );
    }

    const fapUpdated = await this.getFap(args.fapId);

    if (fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${args.fapId}`);
  }

  async assignProposalsToFaps(dataToInsert: AssignProposalsToFapsInput[]) {
    const proposalFapPairs: {
      proposal_pk: number;
      fap_id: number;
    }[] = await database.transaction(async (trx) => {
      try {
        await database('fap_proposals')
          .del()
          .whereIn(
            'proposal_pk',
            dataToInsert.map((data) => data.proposal_pk)
          )
          .transacting(trx);

        const result = await database('fap_proposals')
          .insert(dataToInsert)
          .returning(['*'])
          .transacting(trx);

        return await trx.commit(result);
      } catch (error) {
        throw new GraphQLError(
          `Could not assign proposals ${dataToInsert
            .map((data) => data.proposal_pk)
            .toString()} to FAPs with ids: ${dataToInsert
            .map((data) => data.fap_id)
            .toString()}`
        );
      }
    });

    const returnedProposalPks = removeDuplicates(
      proposalFapPairs.map((proposalFapPair) => proposalFapPair.proposal_pk)
    );

    if (proposalFapPairs?.length) {
      /**
       * NOTE: We need to return changed proposalPks because we listen to events and
       * we need to do some changes on proposals based on what is changed.
       */
      return new ProposalPks(returnedProposalPks);
    }

    throw new GraphQLError(
      `Could not assign proposals ${dataToInsert
        .map((data) => data.proposal_pk)
        .toString()} to FAPs with ids: ${dataToInsert
        .map((data) => data.fap_id)
        .toString()}`
    );
  }

  async removeProposalsFromFaps({
    proposalPks,
    fapIds,
  }: RemoveProposalsFromFapsArgs) {
    const fapProposalRecords = await database('fap_proposals')
      .whereIn('proposal_pk', proposalPks)
      .whereIn('fap_id', fapIds)
      .del()
      .returning<FapProposalRecord[]>('*');

    return fapProposalRecords.map((fpr) => createFapProposalObject(fpr));
  }

  async removeProposalsFromFapsByInstrument(
    proposalPk: number,
    instrumentIds: number[]
  ): Promise<FapProposal[]> {
    const fapProposalRecords = await database('fap_proposals')
      .where('proposal_pk', proposalPk)
      .whereIn('instrument_id', instrumentIds)
      .del()
      .returning('*');

    return fapProposalRecords.map((fpr) => createFapProposalObject(fpr));
  }

  async assignMembersToFapProposals(
    assignments: {
      proposalPk: number;
      memberId: number;
      fapProposalId: number;
    }[],
    fapId: number
  ) {
    await database.transaction(async (trx) => {
      await trx<FapAssignmentRecord>('fap_assignments')
        .insert(
          assignments.map((assignment) => ({
            proposal_pk: assignment.proposalPk,
            fap_member_user_id: assignment.memberId,
            fap_id: fapId,
            fap_proposal_id: assignment.fapProposalId,
          }))
        )
        .returning<FapAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('fap_reviews')
        .insert(
          assignments.map((assignment) => ({
            user_id: assignment.memberId,
            proposal_pk: assignment.proposalPk,
            status: ReviewStatus.DRAFT,
            fap_id: fapId,
            fap_proposal_id: assignment.fapProposalId,
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
      .leftJoin('fap_secretaries', 'fap_secretaries.fap_id', '=', 'faps.fap_id')
      .leftJoin('fap_chairs', 'fap_chairs.fap_id', '=', 'faps.fap_id')
      .where('faps.fap_id', fapId)
      .where((qb) => {
        qb.where('fap_chairs.user_id', userId);
        qb.orWhere('fap_secretaries.user_id', userId);
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
      .leftJoin('fap_secretaries', 'fap_secretaries.fap_id', '=', 'faps.fap_id')
      .leftJoin('fap_chairs', 'fap_chairs.fap_id', '=', 'faps.fap_id')
      .where('fap_proposals.proposal_pk', proposalPk)
      .where((qb) => {
        qb.where('fap_chairs.user_id', userId);
        qb.orWhere('fap_secretaries.user_id', userId);
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
      instrument_id: number;
      fap_id: number;
    } = {
      proposal_pk: saveFapMeetingDecisionInput.proposalPk,
      instrument_id: saveFapMeetingDecisionInput.instrumentId,
      fap_id: saveFapMeetingDecisionInput.fapId,
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
        `? ON CONFLICT (proposal_pk, instrument_id)
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

  async getAllFapMeetingDecisions(
    fapId: number
  ): Promise<FapMeetingDecision[]> {
    return database
      .select()
      .from('fap_meeting_decisions')
      .where('fap_id', fapId)
      .then((fapMeetingDecisionRecords: FapMeetingDecisionRecord[]) => {
        if (!fapMeetingDecisionRecords.length) {
          return [];
        }

        return fapMeetingDecisionRecords.map((fapMeetingDecisionRecord) =>
          createFapMeetingDecisionObject(fapMeetingDecisionRecord)
        );
      });
  }

  async getProposalsFapMeetingDecisions(
    proposalPks: number[],
    fapId?: number
  ): Promise<FapMeetingDecision[]> {
    return database
      .select()
      .from('fap_meeting_decisions')
      .whereIn('proposal_pk', proposalPks)
      .modify((query) => {
        if (fapId) {
          query.andWhere('fap_id', fapId);
        }
      })
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
    const relatedFapMembers = await database
      .select('sr.user_id')
      .distinct()
      .from('faps as s')
      .leftJoin('fap_secretaries as fs', 'fs.fap_id', 's.fap_id')
      .leftJoin('fap_chairs as fc', 'fc.fap_id', 's.fap_id')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('fc.user_id', id); // where the user is a chair
          this.orOnVal('fs.user_id', id); // where the user is the secretary
        });
      }) // this gives a list of proposals that a user is related to
      .join('fap_reviewers as sr', { 'sr.fap_id': 's.fap_id' }); // this gives us all of the associated reviewers

    const relatedFapChairsAndSecs = await database
      .select(
        'fc.user_id as fap_chair_user_id',
        'fs.user_id as fap_secretary_user_id'
      )
      .distinct()
      .from('faps as s')
      .leftJoin('fap_secretaries as fs', 'fs.fap_id', 's.fap_id')
      .leftJoin('fap_chairs as fc', 'fc.fap_id', 's.fap_id')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('fc.user_id', id); // where the user is a chair
          this.orOnVal('fs.user_id', id); // where the user is the secretary
        });
      });

    const relatedUsers = [
      ...relatedFapMembers.map((r) => r.user_id),
      ...relatedFapChairsAndSecs.map((r) => r.fap_chair_user_id),
      ...relatedFapChairsAndSecs.map((r) => r.fap_secretary_user_id),
    ];

    return relatedUsers;
  }

  async getSecretariesAndChairs(fap: Fap): Promise<Fap> {
    const recordSec: FapSecretariesRecord[] = await database
      .from('fap_secretaries')
      .select('*')
      .where({ fap_id: fap.id });

    const recordChair: FapChairsRecord[] = await database
      .from('fap_chairs')
      .select('*')
      .where({ fap_id: fap.id });

    return {
      ...fap,
      fapSecretariesUserIds: recordSec.map((sec) => sec.user_id),
      fapChairUserIds: recordChair.map((chair) => chair.user_id),
    };
  }

  async isFapProposalInstrumentSubmitted(
    proposalPk: number,
    instrumentId?: number | null
  ): Promise<boolean> {
    return database('fap_proposals')
      .select()
      .where('proposal_pk', proposalPk)
      .modify((query) => {
        if (instrumentId) {
          query.andWhere('instrument_id', instrumentId);
        }
      })
      .first()
      .then((result?: FapProposalRecord) => {
        if (!result) {
          return false;
        }

        return result.fap_meeting_instrument_submitted;
      });
  }

  async setReviewerRank(
    proposalPk: number,
    reviewer_id: number,
    rank: number
  ): Promise<boolean> {
    return database
      .update(
        {
          rank: rank,
        },
        ['*']
      )
      .from('fap_assignments')
      .where('proposal_pk', proposalPk)
      .andWhere('fap_member_user_id', reviewer_id)
      .then((records: FapAssignmentRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError('Fap assignment not found');
        }

        return true;
      });
  }

  async getFapReviewData(
    callId: number,
    fapId: number
  ): Promise<FapReviewsRecord[]> {
    return await database
      .select('*')
      .from('review_data')
      .where('fap_id', fapId)
      .andWhere('call_id', callId);
  }

  async submitFapMeetings(
    callId: number,
    fapId: number,
    userId?: number
  ): Promise<FapProposal[]> {
    const allProposals: FapProposalRecord[] = await database
      .select('*')
      .from('fap_proposals')
      .where('fap_id', fapId)
      .andWhere('call_id', callId);

    const proposals: FapMeetingDecisionRecord[] = await database
      .select('fm.*')
      .from('fap_meeting_decisions as fm')
      .leftJoin('fap_proposals as fp', function () {
        this.on('fm.proposal_pk', '=', 'fp.proposal_pk').andOn(
          'fm.instrument_id',
          '=',
          'fp.instrument_id'
        );
      })
      .where('fp.fap_id', fapId)
      .andWhere('fp.call_id', callId);

    const readyProposals: FapMeetingDecisionRecord[] = proposals.filter(
      (proposal) =>
        proposal.comment_for_management &&
        proposal.comment_for_user &&
        proposal.recommendation
    );

    await Promise.all(
      readyProposals.map((proposal) =>
        this.saveFapMeetingDecision(
          { ...createFapMeetingDecisionObject(proposal), submitted: true },
          userId
        )
      )
    );

    const incompleteProposals = allProposals.filter(
      (proposal) =>
        !readyProposals.find(
          (readyProp) =>
            readyProp.proposal_pk === proposal.proposal_pk &&
            readyProp.instrument_id === proposal.instrument_id
        )
    );

    return incompleteProposals.map((proposal) =>
      createFapProposalObject(proposal)
    );
  }
}
