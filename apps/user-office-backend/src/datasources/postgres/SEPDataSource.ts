import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import { ProposalEndStatus, ProposalPks } from '../../models/Proposal';
import { Review, ReviewStatus } from '../../models/Review';
import { Role, Roles } from '../../models/Role';
import {
  SEP,
  SEPAssignment,
  SEPReviewer,
  SEPProposal,
  SEPProposalWithReviewGradesAndRanking,
} from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import { UserRole } from '../../models/User';
import {
  UpdateMemberSEPArgs,
  AssignReviewersToSEPArgs,
  AssignChairOrSecretaryToSEPInput,
} from '../../resolvers/mutations/AssignMembersToSepMutation';
import { AssignProposalsToSepArgs } from '../../resolvers/mutations/AssignProposalsToSepMutation';
import { SaveSEPMeetingDecisionInput } from '../../resolvers/mutations/SEPMeetingDecisionMutation';
import { SEPsFilter } from '../../resolvers/queries/SEPsQuery';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import {
  SEPRecord,
  SEPAssignmentRecord,
  RoleRecord,
  SEPProposalRecord,
  ReviewRecord,
  SEPReviewerRecord,
  createSEPObject,
  createSEPAssignmentObject,
  createSEPProposalObject,
  createSEPReviewerObject,
  createSepMeetingDecisionObject,
  createRoleObject,
  RoleUserRecord,
  SepMeetingDecisionRecord,
  SepProposalWithReviewGradesAndRankingRecord,
  createReviewObject,
} from './records';

export default class PostgresSEPDataSource implements SEPDataSource {
  async delete(id: number): Promise<SEP> {
    return database
      .where('SEPs.sep_id', id)
      .del()
      .from('SEPs')
      .returning('*')
      .then((sep: SEPRecord[]) => {
        if (sep === undefined || sep.length !== 1) {
          throw new GraphQLError(`Could not delete sep with id:${id}`);
        }

        return createSEPObject(sep[0]);
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
      .from('SEPs')
      .then((resultSet: SEPRecord[]) => createSEPObject(resultSet[0]));
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
      .from('SEPs')
      .where('sep_id', id)
      .then((records: SEPRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`SEP not found ${id}`);
        }

        return createSEPObject(records[0]);
      });
  }

  async getSEP(id: number) {
    return database
      .select()
      .from('SEPs')
      .where('sep_id', id)
      .first()
      .then((sep: SEPRecord) => {
        return sep ? createSEPObject(sep) : null;
      });
  }

  async getUserSepsByRoleAndSepId(
    userId: number,
    role: Role,
    sepId?: number
  ): Promise<SEP[]> {
    const sepRecords = await database<SEPRecord[]>('SEPs')
      .select<SEPRecord[]>('SEPs.*')
      .leftJoin('SEP_Reviewers', 'SEP_Reviewers.sep_id', '=', 'SEPs.sep_id')
      .where((qb) => {
        if (sepId) {
          qb.where('SEPs.sep_id', sepId);
        }
        if (role.shortCode === Roles.SEP_CHAIR) {
          qb.where('sep_chair_user_id', userId);
        } else if (role.shortCode === Roles.SEP_SECRETARY) {
          qb.where('sep_secretary_user_id', userId);
        } else {
          qb.where('SEP_Reviewers.user_id', userId);
        }
      });

    return sepRecords.map(createSEPObject);
  }

  async getSepsByCallId(callId: number): Promise<SEP[]> {
    return database
      .select('*')
      .from('SEPs as s')
      .join('call_has_seps as chs', {
        's.sep_id': 'chs.sep_id',
      })
      .where('chs.call_id', callId)
      .distinct('s.sep_id')
      .then((seps: SEPRecord[]) => {
        return seps.map(createSEPObject);
      });
  }

  async getUserSeps(userId: number, role: Role): Promise<SEP[]> {
    const qb = database<SEPRecord>('SEPs').select<SEPRecord[]>('SEPs.*');

    if (role.shortCode === Roles.SEP_CHAIR) {
      qb.where('sep_chair_user_id', userId);
    } else if (role.shortCode === Roles.SEP_SECRETARY) {
      qb.where('sep_secretary_user_id', userId);
    } else if (role.shortCode === Roles.SEP_REVIEWER) {
      qb.join(
        'SEP_Reviewers',
        'SEP_Reviewers.sep_id',
        '=',
        'SEPs.sep_id'
      ).where('SEP_Reviewers.user_id', userId);
    } else {
      logger.logWarn('User tried to list its SEPs but has invalid role', {
        userId,
        role,
      });

      return [];
    }

    const sepRecords = await qb;

    return sepRecords.map(createSEPObject);
  }

  async getSEPs({
    active,
    callIds,
    filter,
    first,
    offset,
  }: SEPsFilter): Promise<{ totalCount: number; seps: SEP[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('SEPs')
      .orderBy('SEPs.sep_id', 'desc')
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
            .leftJoin('call_has_seps as chs', 'chs.sep_id', 'SEPs.sep_id')
            .whereIn('chs.call_id', callIds);
        }
      })
      .then((allSeps: SEPRecord[]) => {
        const seps = allSeps.map((sep) => createSEPObject(sep));

        return {
          totalCount: allSeps[0] ? allSeps[0].full_count : 0,
          seps,
        };
      });
  }

  async getSEPProposalAssignments(
    sepId: number,
    proposalPk: number,
    reviewerId: number | null
  ): Promise<SEPAssignment[]> {
    const sepAssignments: SEPAssignmentRecord[] = await database
      .from('SEP_Assignments')
      .modify((query) => {
        if (reviewerId !== null) {
          query.where('sep_member_user_id', reviewerId);
        }
      })
      .where('sep_id', sepId)
      .andWhere('proposal_pk', proposalPk);

    return sepAssignments.map((sepAssignment) =>
      createSEPAssignmentObject(sepAssignment)
    );
  }

  async getSEPProposals(
    sepId: number,
    callId: number | null
  ): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .select(['sp.*'])
      .from('SEP_Proposals as sp')
      .modify((query) => {
        query
          .join('proposals as p', {
            'p.proposal_pk': 'sp.proposal_pk',
          })
          .join('proposal_statuses as ps', {
            'p.status_id': 'ps.proposal_status_id',
          })
          .where(function () {
            this.where('ps.name', 'ilike', 'SEP_%');
          });

        if (callId) {
          query.andWhere('p.call_id', callId);
        }
      })
      .where('sp.sep_id', sepId);

    return sepProposals.map((sepProposal) =>
      createSEPProposalObject(sepProposal)
    );
  }

  async getSEPProposalCount(sepId: number): Promise<number> {
    return database('SEP_Proposals')
      .count('sep_id')
      .where('sep_id', sepId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async getSEPReviewerProposalCount(reviewerId: number): Promise<number> {
    return database('SEP_Reviews')
      .count('user_id')
      .where('user_id', reviewerId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async getSEPReviewsByCallAndStatus(
    callIds: number[],
    status: ReviewStatus
  ): Promise<Review[]> {
    const sepReviews: ReviewRecord[] = await database
      .select(['sr.*'])
      .from('SEP_Reviews as sr')
      .join('SEP_Proposals as sp', {
        'sp.proposal_pk': 'sr.proposal_pk',
      })
      .whereIn('sp.call_id', callIds)
      .andWhere('sr.status', status)
      .andWhere('sr.notification_email_sent', false);

    return sepReviews.map((sepReview) => createReviewObject(sepReview));
  }

  async setSEPReviewNotificationEmailSent(
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
      .from('SEP_Reviews')
      .where('review_id', reviewId)
      .andWhere('user_id', userId)
      .andWhere('proposal_pk', proposalPk)
      .then((records: ReviewRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`SEP review not found ${reviewId}`);
        }

        return true;
      });
  }

  async getSEPProposal(
    sepId: number,
    proposalPk: number
  ): Promise<SEPProposal | null> {
    const sepProposal: SEPProposalRecord = await database
      .select(['sp.*'])
      .from('SEP_Proposals as sp')
      .join('proposals as p', {
        'p.proposal_pk': 'sp.proposal_pk',
      })
      .where('sp.sep_id', sepId)
      .where('sp.proposal_pk', proposalPk)
      .first();

    return sepProposal ? createSEPProposalObject(sepProposal) : null;
  }

  async getSEPProposalsByInstrument(
    sepId: number,
    instrumentId: number,
    callId: number
  ): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .select([
        'sp.proposal_pk',
        'sp.sep_id',
        'sp.sep_time_allocation',
        'ihp.submitted as instrument_submitted',
      ])
      .from('SEP_Proposals as sp')
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
      .where('sp.sep_id', sepId)
      .andWhere('ihp.instrument_id', instrumentId);

    return sepProposals.map((sepProposal) =>
      createSEPProposalObject(sepProposal)
    );
  }

  async getMembers(sepId: number): Promise<SEPReviewer[]> {
    const reviewerRecords: SEPReviewerRecord[] = await database
      .from('SEP_Reviewers')
      .where('sep_id', sepId);

    const sep = await this.getSEP(sepId);

    if (!sep) {
      throw new GraphQLError(`SEP not found ${sepId}`);
    }

    sep.sepChairUserId !== null &&
      reviewerRecords.unshift({
        user_id: sep.sepChairUserId,
        sep_id: sepId,
      });

    sep.sepSecretaryUserId !== null &&
      reviewerRecords.unshift({
        user_id: sep.sepSecretaryUserId,
        sep_id: sepId,
      });

    return reviewerRecords.map(createSEPReviewerObject);
  }

  async getReviewers(sepId: number): Promise<SEPReviewer[]> {
    const reviewerRecords: SEPReviewerRecord[] = await database
      .from('SEP_Reviewers')
      .where('sep_id', sepId);

    return reviewerRecords.map(createSEPReviewerObject);
  }

  async getSEPUserRole(userId: number, sepId: number): Promise<Role | null> {
    const sep = await this.getSEP(sepId);

    if (!sep) {
      throw new GraphQLError(`SEP not found ${sepId}`);
    }

    let shortCode: Roles;

    if (sep.sepChairUserId === userId) {
      shortCode = Roles.SEP_CHAIR;
    } else if (sep.sepSecretaryUserId === userId) {
      shortCode = Roles.SEP_SECRETARY;
    } else {
      shortCode = Roles.SEP_REVIEWER;
    }

    const roleRecord = await database<RoleRecord>('roles')
      .where('short_code', shortCode)
      .first();

    if (!roleRecord) {
      throw new GraphQLError(
        `Role with short code ${shortCode} does not exist`
      );
    }

    if (shortCode === Roles.SEP_REVIEWER) {
      const sepReviewerRecord = await database<SEPReviewerRecord>(
        'SEP_Reviewers'
      )
        .select('*')
        .where('user_id', userId)
        .where('sep_id', sepId)
        .first();

      if (!sepReviewerRecord) {
        return null;
      }
    }

    return createRoleObject(roleRecord);
  }

  async getSEPByProposalPk(proposalPk: number): Promise<SEP | null> {
    return database
      .select()
      .from('SEPs as s')
      .join('SEP_Proposals as sp', { 's.sep_id': 'sp.sep_id' })
      .where('sp.proposal_pk', proposalPk)
      .first()
      .then((sep: SEPRecord) => {
        if (sep) {
          return createSEPObject(sep);
        }

        return null;
      });
  }

  async assignChairOrSecretaryToSEP(
    args: AssignChairOrSecretaryToSEPInput
  ): Promise<SEP> {
    await database.transaction(async (trx) => {
      const isChairAssignment = args.roleId === UserRole.SEP_CHAIR;

      await trx<SEPRecord>('SEPs')
        .update({
          [isChairAssignment ? 'sep_chair_user_id' : 'sep_secretary_user_id']:
            args.userId,
        })
        .where('sep_id', args.sepId);

      const shortCode = isChairAssignment
        ? Roles.SEP_CHAIR
        : Roles.SEP_SECRETARY;
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

    const sepUpdated = await this.getSEP(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new GraphQLError(`SEP not found ${args.sepId}`);
  }

  async assignReviewersToSEP(args: AssignReviewersToSEPArgs): Promise<SEP> {
    await database<SEPReviewerRecord>('SEP_Reviewers').insert(
      args.memberIds.map((userId) => ({
        sep_id: args.sepId,
        user_id: userId,
      }))
    );

    const sepUpdated = await this.getSEP(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new GraphQLError(`SEP not found ${args.sepId}`);
  }

  async removeMemberFromSEP(
    args: UpdateMemberSEPArgs,
    isMemberChairOrSecretaryOfSEP: boolean
  ) {
    if (isMemberChairOrSecretaryOfSEP) {
      const field =
        args.roleId === UserRole.SEP_CHAIR
          ? 'sep_chair_user_id'
          : 'sep_secretary_user_id';

      const updateResult = await database<SEPRecord>('SEPs')
        .update({
          [field]: null,
        })
        .where('sep_id', args.sepId);

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove sep member ${args.memberId} (${field}), sep id ${args.sepId}`
        );
      }
    } else {
      const updateResult = await database<SEPReviewerRecord>('SEP_Reviewers')
        .where('sep_id', args.sepId)
        .where('user_id', args.memberId)
        .del();

      if (!updateResult) {
        throw new GraphQLError(
          `Failed to remove sep member ${args.memberId}, sep id ${args.sepId}`
        );
      }
    }

    const sepUpdated = await this.getSEP(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new GraphQLError(`SEP not found ${args.sepId}`);
  }

  async assignProposalsToSep({ proposals, sepId }: AssignProposalsToSepArgs) {
    const dataToInsert = proposals.map((proposal) => ({
      sep_id: sepId,
      proposal_pk: proposal.primaryKey,
      call_id: proposal.callId,
    }));

    const proposalSepPairs: {
      proposal_pk: number;
      sep_id: number;
    }[] = await database.transaction(async (trx) => {
      try {
        /**
         * NOTE: First delete all connections that should be changed,
         * because currently we only support one proposal to be assigned on one SEP.
         * So we don't end up in a situation that one proposal is assigned to multiple SEPs
         * which is not supported scenario by the frontend because it only shows one SEP per proposal.
         */
        await database('SEP_Proposals')
          .del()
          .whereIn(
            'proposal_pk',
            proposals.map((proposal) => proposal.primaryKey)
          )
          .transacting(trx);

        const result = await database('SEP_Proposals')
          .insert(dataToInsert)
          .returning(['*'])
          .transacting(trx);

        return await trx.commit(result);
      } catch (error) {
        throw new GraphQLError(
          `Could not assign proposals ${proposals} to SEP with id: ${sepId}`
        );
      }
    });

    const returnedProposalPks = proposalSepPairs.map(
      (proposalSepPair) => proposalSepPair.proposal_pk
    );

    if (proposalSepPairs?.length) {
      /**
       * NOTE: We need to return changed proposalPks because we listen to events and
       * we need to do some changes on proposals based on what is changed.
       */
      return new ProposalPks(returnedProposalPks);
    }

    throw new GraphQLError(
      `Could not assign proposals ${proposals} to SEP with id: ${sepId}`
    );
  }

  async removeProposalsFromSep(proposalPks: number[], sepId: number) {
    await database.transaction(async (trx) => {
      await trx('SEP_Proposals')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('sep_id', sepId)
        .del();

      await trx('SEP_Assignments')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('sep_id', sepId)
        .del();

      await trx('SEP_Reviews')
        .whereIn('proposal_pk', proposalPks)
        .andWhere('sep_id', sepId)
        .del();
    });

    const sepUpdated = await this.getSEP(sepId);

    if (!sepUpdated) {
      throw new GraphQLError(`SEP not found ${sepId}`);
    }

    return sepUpdated;
  }

  async assignMemberToSEPProposal(
    proposalPk: number,
    sepId: number,
    memberIds: number[]
  ) {
    await database.transaction(async (trx) => {
      await trx<SEPAssignmentRecord>('SEP_Assignments')
        .insert(
          memberIds.map((memberId) => ({
            proposal_pk: proposalPk,
            sep_member_user_id: memberId,
            sep_id: sepId,
          }))
        )
        .returning<SEPAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('SEP_Reviews')
        .insert(
          memberIds.map((memberId) => ({
            user_id: memberId,
            proposal_pk: proposalPk,
            status: ReviewStatus.DRAFT,
            sep_id: sepId,
          }))
        )
        .returning<ReviewRecord[]>(['*']);
    });

    const updatedSep = await this.getSEP(sepId);

    if (updatedSep) {
      return updatedSep;
    }

    throw new GraphQLError(`SEP not found ${sepId}`);
  }

  async removeMemberFromSepProposal(
    proposalPk: number,
    sepId: number,
    memberId: number
  ) {
    const memberRemovedFromProposal = await database('SEP_Assignments')
      .del()
      .where('sep_id', sepId)
      .andWhere('proposal_pk', proposalPk)
      .andWhere('sep_member_user_id', memberId);

    const sepUpdated = await this.getSEP(sepId);

    if (memberRemovedFromProposal && sepUpdated) {
      return sepUpdated;
    }

    throw new GraphQLError(`SEP not found ${sepId}`);
  }

  async updateTimeAllocation(
    sepId: number,
    proposalPk: number,
    sepTimeAllocation: number | null
  ): Promise<SEPProposal> {
    const [updatedRecord]: SEPProposalRecord[] = await database('SEP_Proposals')
      .update(
        {
          sep_time_allocation: sepTimeAllocation,
        },
        ['*']
      )
      .where('sep_id', sepId)
      .where('proposal_pk', proposalPk);

    if (!updatedRecord) {
      throw new GraphQLError(
        `SEP_Proposal not found, sepId: ${sepId}, proposalPk: ${proposalPk}`
      );
    }

    return createSEPProposalObject(updatedRecord);
  }

  async isChairOrSecretaryOfSEP(
    userId: number,
    sepId: number
  ): Promise<boolean> {
    const record = await database<SEPRecord>('SEPs')
      .select('*')
      .where('sep_id', sepId)
      .where((qb) => {
        qb.where('sep_chair_user_id', userId);
        qb.orWhere('sep_secretary_user_id', userId);
      })
      .first();

    return record !== undefined;
  }

  async isChairOrSecretaryOfProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean> {
    const record = await database<SEPRecord>('SEPs')
      .select<SEPRecord>(['SEPs.*'])
      .join('SEP_Proposals', 'SEP_Proposals.sep_id', '=', 'SEPs.sep_id')
      .where('SEP_Proposals.proposal_pk', proposalPk)
      .where((qb) => {
        qb.where('sep_chair_user_id', userId);
        qb.orWhere('sep_secretary_user_id', userId);
      })
      .first();

    return record !== undefined;
  }

  async saveSepMeetingDecision(
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<SepMeetingDecision> {
    const dataToUpsert: {
      proposal_pk: number;
      rank_order?: number;
      comment_for_management?: string;
      comment_for_user?: string;
      recommendation?: ProposalEndStatus;
      submitted?: boolean;
      submitted_by?: number | null;
    } = {
      proposal_pk: saveSepMeetingDecisionInput.proposalPk,
    };

    const updateQuery = [];

    if (submittedBy) {
      dataToUpsert.submitted_by = submittedBy;
      updateQuery.push('submitted_by = EXCLUDED.submitted_by');
    }
    if (saveSepMeetingDecisionInput.rankOrder) {
      dataToUpsert.rank_order = saveSepMeetingDecisionInput.rankOrder;
      updateQuery.push('rank_order = EXCLUDED.rank_order');
    }

    if (saveSepMeetingDecisionInput.commentForManagement) {
      dataToUpsert.comment_for_management =
        saveSepMeetingDecisionInput.commentForManagement;
      updateQuery.push(
        'comment_for_management = EXCLUDED.comment_for_management'
      );
    }

    if (saveSepMeetingDecisionInput.commentForUser) {
      dataToUpsert.comment_for_user =
        saveSepMeetingDecisionInput.commentForUser;
      updateQuery.push('comment_for_user = EXCLUDED.comment_for_user');
    }

    if (saveSepMeetingDecisionInput.recommendation !== undefined) {
      dataToUpsert.recommendation = saveSepMeetingDecisionInput.recommendation;
      updateQuery.push('recommendation = EXCLUDED.recommendation');
    }

    if (saveSepMeetingDecisionInput.submitted !== undefined) {
      dataToUpsert.submitted = saveSepMeetingDecisionInput.submitted;
      updateQuery.push('submitted = EXCLUDED.submitted');
    }

    const [sepMeetingDecisionRecord]: SepMeetingDecisionRecord[] = (
      await database.raw(
        `? ON CONFLICT (proposal_pk)
        DO UPDATE SET
        ${updateQuery.join(',')}
        RETURNING *;`,
        [database('SEP_meeting_decisions').insert(dataToUpsert)]
      )
    ).rows;

    if (!sepMeetingDecisionRecord) {
      logger.logError('Could not update/insert sep meeting decision', {
        dataToUpsert,
      });

      throw new GraphQLError('Could not update/insert sep meeting decision');
    }

    return createSepMeetingDecisionObject(sepMeetingDecisionRecord);
  }

  async getProposalsSepMeetingDecisions(
    proposalPks: number[]
  ): Promise<SepMeetingDecision[]> {
    return database
      .select()
      .from('SEP_meeting_decisions')
      .whereIn('proposal_pk', proposalPks)
      .then((sepMeetingDecisionRecords: SepMeetingDecisionRecord[]) => {
        if (!sepMeetingDecisionRecords.length) {
          return [];
        }

        return sepMeetingDecisionRecords.map((sepMeetingDecisionRecord) =>
          createSepMeetingDecisionObject(sepMeetingDecisionRecord)
        );
      });
  }

  async getSepProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<SEPProposalWithReviewGradesAndRanking[]> {
    return database('SEP_Proposals as sp')
      .select([
        'sp.proposal_pk',
        database.raw('json_agg(sr.grade) review_grades'),
        'smd.rank_order',
      ])
      .join('SEP_meeting_decisions as smd', {
        'smd.proposal_pk': 'sp.proposal_pk',
      })
      .join('SEP_Reviews as sr', {
        'sr.proposal_pk': 'sp.proposal_pk',
      })
      .whereIn('sp.proposal_pk', proposalPks)
      .groupBy(['sp.proposal_pk', 'smd.rank_order'])
      .then(
        (
          SepProposalWithReviewGradesAndRankingRecords: SepProposalWithReviewGradesAndRankingRecord[]
        ) => {
          const sepProposalWithReviewGradesAndRanking =
            SepProposalWithReviewGradesAndRankingRecords.map(
              (SepProposalWithReviewGradesAndRankingRecord) =>
                new SEPProposalWithReviewGradesAndRanking(
                  SepProposalWithReviewGradesAndRankingRecord.proposal_pk,
                  SepProposalWithReviewGradesAndRankingRecord.rank_order,
                  SepProposalWithReviewGradesAndRankingRecord.review_grades
                )
            );

          return sepProposalWithReviewGradesAndRanking;
        }
      );
  }
  async getRelatedUsersOnSep(id: number): Promise<number[]> {
    const relatedSepMembeers = await database
      .select('sr.user_id')
      .distinct()
      .from('SEPs as s')
      .leftJoin('SEP_Reviewers as r', function () {
        this.on('s.sep_id', 'r.sep_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.sep_chair_user_id', id); // where the user is a chair
          this.orOnVal('s.sep_secretary_user_id', id); // where the user is the secretary
        });
      }) // this gives a list of proposals that a user is related to
      .join('SEP_Reviewers as sr', { 'sr.sep_id': 's.sep_id' }); // this gives us all of the associated reviewers

    const relatedSepChairsAndSecs = await database
      .select('s.sep_chair_user_id', 's.sep_secretary_user_id')
      .distinct()
      .from('SEPs as s')
      .leftJoin('SEP_Reviewers as r', function () {
        this.on('s.sep_id', 'r.sep_id');
        this.andOn(function () {
          this.onVal('r.user_id', id); // where the user is part of the visit
          this.orOnVal('s.sep_chair_user_id', id); // where the user is a chair
          this.orOnVal('s.sep_secretary_user_id', id); // where the user is the secretary
        });
      });

    const relatedUsers = [
      ...relatedSepMembeers.map((r) => r.user_id),
      ...relatedSepChairsAndSecs.map((r) => r.sep_chair_user_id),
      ...relatedSepChairsAndSecs.map((r) => r.sep_secretary_user_id),
    ];

    return relatedUsers;
  }
}
