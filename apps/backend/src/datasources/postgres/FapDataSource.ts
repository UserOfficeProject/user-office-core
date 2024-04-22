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
import { SettingsId } from '../../models/Settings';
import { BasicUserDetails, UserRole } from '../../models/User';
import {
  UpdateMemberFapArgs,
  AssignReviewersToFapArgs,
  AssignChairOrSecretaryToFapInput,
} from '../../resolvers/mutations/AssignMembersToFapMutation';
import { AssignProposalsToFapArgs } from '../../resolvers/mutations/AssignProposalsToFapMutation';
import { SaveFapMeetingDecisionInput } from '../../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../../resolvers/queries/FapsQuery';
import { AdminDataSource } from '../AdminDataSource';
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
  InstitutionRecord,
  CountryRecord,
} from './records';

@injectable()
export default class PostgresFapDataSource implements FapDataSource {
  constructor(
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource,
    @inject(Tokens.AdminDataSource) private adminDataSource: AdminDataSource
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
      })
      .then((fap) => (fap ? this.getSecretaries(fap) : null));
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
      .where((qb) => {
        if (fapId) {
          qb.where('faps.fap_id', fapId);
        }
        if (role.shortCode === Roles.FAP_CHAIR) {
          qb.where('fap_chair_user_id', userId);
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
        return Promise.all(faps.map(this.getSecretaries));
      });
  }

  async getUserFaps(userId: number, role: Role): Promise<Fap[]> {
    const qb = database<FapRecord>('faps').select<FapRecord[]>('faps.*');

    if (role.shortCode === Roles.FAP_CHAIR) {
      qb.where('fap_chair_user_id', userId);
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
      fapRecords.map(createFapObject).map(this.getSecretaries)
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
          allFaps.map(createFapObject).map(this.getSecretaries)
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
    const fapProposalReviewers: Array<
      // eslint-disable-next-line prettier/prettier
      UserRecord & InstitutionRecord & CountryRecord > =
      // eslint-disable-next-line prettier/prettier
      await database
        .select(['users.*', 'institutions.*']) // Adjusted here
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

  async getFapReviewsByCallAndFap(
    callId: number,
    fapId: number
  ): Promise<Review[]> {
    const fapReviews: ReviewRecord[] = await database
      .select(['sr.*'])
      .from('fap_reviews as sr')
      .join('fap_proposals as sp', {
        'sp.proposal_pk': 'sr.proposal_pk',
      })
      .where('sp.call_id', callId)
      .andWhere('sp.fap_id', fapId);

    return fapReviews.map((fapReview) => createReviewObject(fapReview));
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
      .where('fp.fap_id', fapId)
      .andWhere('fp.instrument_id', instrumentId);

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

    const fap = await this.getFap(fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    fap.fapChairUserId !== null &&
      reviewerRecords.unshift({
        user_id: fap.fapChairUserId,
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
    const fapSecretaries = await database<FapSecretariesRecord>(
      'fap_secretaries'
    )
      .select('user_id')
      .where('fap_id', fapId);

    if (!fap) {
      throw new GraphQLError(`Fap not found ${fapId}`);
    }

    let shortCode: Roles;

    if (fap.fapChairUserId === userId) {
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
          return this.getSecretaries(createFapObject(fap));
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

      isChairAssignment
        ? await trx<FapRecord>('faps')
            .update({
              fap_chair_user_id: args.userId,
            })
            .where('fap_id', args.fapId)
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
    if (args.roleId === UserRole.FAP_CHAIR) {
      const updateResult = await database<FapRecord>('faps')
        .update({
          fap_chair_user_id: null,
        })
        .where('fap_id', args.fapId);

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove fap member ${args.memberId} (fap_chair_user_id), fap id ${args.fapId}`
        );
      }
    } else {
      const table =
        args.roleId === UserRole.FAP_SECRETARY
          ? 'fap_secretaries'
          : 'fap_reviewers';

      const updateResult = await database<FapReviewerRecord>(table)
        .where('fap_id', args.fapId)
        .where('user_id', args.memberId)
        .del();

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove ${args.memberId}from ${table}, fap id ${args.fapId}`
        );
      }
    }

    const fapUpdated = await this.getFap(args.fapId);

    if (fapUpdated) {
      return fapUpdated;
    }

    throw new GraphQLError(`Fap not found ${args.fapId}`);
  }

  async assignProposalsToFap({
    proposals,
    fapId,
    fapInstrumentId,
  }: AssignProposalsToFapArgs) {
    const dataToInsert = proposals.map((proposal) => ({
      fap_id: fapId,
      instrument_id: fapInstrumentId,
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

  async assignMemberToFapProposals(
    proposalPks: number[],
    fapId: number,
    memberId: number
  ) {
    await database.transaction(async (trx) => {
      await trx<FapAssignmentRecord>('fap_assignments')
        .insert(
          proposalPks.map((proposalPk) => ({
            proposal_pk: proposalPk,
            fap_member_user_id: memberId,
            fap_id: fapId,
          }))
        )
        .returning<FapAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('fap_reviews')
        .insert(
          proposalPks.map((proposalPk) => ({
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

  private async getCallInReviewForFap(fapId: number) {
    const callFilter = {
      isEnded: true,
      isFapReviewEnded: false,
      fapIds: [fapId],
    };

    const callIds = (await this.callDataSource.getCalls(callFilter)).map(
      (call) => call.id
    );

    if (callIds.length > 1) {
      throw new GraphQLError(
        `More than one call found in review phase for FAP: ${fapId}`
      );
    }

    return callIds[0];
  }

  async getFapProposalToNumReviewsNeededMap(fapId: number) {
    const DEFAULT_NUM_FAP_REVIEWS_REQUIRED =
      await this.adminDataSource.getSettingOrDefault(
        SettingsId.DEFAULT_NUM_FAP_REVIEWS_REQUIRED,
        2
      );
    const fap = await this.getFap(fapId);
    const numReviewsRequired = fap
      ? fap.numberRatingsRequired
      : DEFAULT_NUM_FAP_REVIEWS_REQUIRED;
    const callId = await this.getCallInReviewForFap(fapId);
    const fapProposals = await this.getFapProposals(fapId, callId);
    const fapReviews = await this.getFapReviewsByCallAndFap(callId, fapId);

    const propNumReviewsMap = new Map<FapProposal, number>();

    fapProposals.forEach((fapProposal) => {
      const numReviewsStillNeeded =
        numReviewsRequired -
        fapReviews.filter(
          (fapReview) => fapReview.proposalPk === fapProposal.proposalPk
        ).length;
      propNumReviewsMap.set(fapProposal, numReviewsStillNeeded);
    });

    return propNumReviewsMap;
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
      .leftJoin('fap_secretaries', 'fap_secretaries.fap_id', '=', 'faps.fap_id')
      .where('faps.fap_id', fapId)
      .where((qb) => {
        qb.where('fap_chair_user_id', userId);
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
      .where('fap_proposals.proposal_pk', proposalPk)
      .where((qb) => {
        qb.where('fap_chair_user_id', userId);
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
    const relatedFapMembers = await database
      .select('sr.user_id')
      .distinct()
      .from('faps as s')
      .leftJoin('fap_secretaries as fs', 'fs.fap_id', 's.fap_id')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.fap_chair_user_id', id); // where the user is a chair
          this.orOnVal('fs.user_id', id); // where the user is the secretary
        });
      }) // this gives a list of proposals that a user is related to
      .join('fap_reviewers as sr', { 'sr.fap_id': 's.fap_id' }); // this gives us all of the associated reviewers

    const relatedFapChairsAndSecs = await database
      .select('s.fap_chair_user_id', 'fs.user_id as fap_secretary_user_id')
      .distinct()
      .from('faps as s')
      .leftJoin('fap_secretaries as fs', 'fs.fap_id', 's.fap_id')
      .leftJoin('fap_reviewers as r', function () {
        this.on('s.fap_id', 'r.fap_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.fap_chair_user_id', id); // where the user is a chair
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

  async getSecretaries(fap: Fap): Promise<Fap> {
    const record: FapSecretariesRecord[] = await database
      .from('fap_secretaries')
      .select('*')
      .where({ fap_id: fap.id });

    return { ...fap, fapSecretariesUserIds: record.map((sec) => sec.user_id) };
  }

  async isFapProposalInstrumentSubmitted(
    proposalPk: number,
    instrumentId?: number
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
}
