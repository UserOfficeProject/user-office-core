import { logger } from '@esss-swap/duo-logger';

import { ProposalIdsWithNextStatus } from '../../models/Proposal';
import { ReviewStatus } from '../../models/Review';
import { Role, Roles } from '../../models/Role';
import { SEP, SEPAssignment, SEPReviewer, SEPProposal } from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import { UserRole } from '../../models/User';
import {
  UpdateMemberSEPArgs,
  AssignReviewersToSEPArgs,
  AssignChairOrSecretaryToSEPInput,
} from '../../resolvers/mutations/AssignMembersToSEP';
import { SaveSEPMeetingDecisionInput } from '../../resolvers/mutations/SEPMeetingDecisionMutation';
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
          throw new Error(`Could not delete sep with id:${id}`);
        }

        return createSEPObject(sep[0]);
      });
  }
  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return database
      .insert(
        {
          code: code,
          description: description,
          number_ratings_required: numberRatingsRequired,
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
    active: boolean
  ) {
    return database
      .update(
        {
          code,
          description,
          number_ratings_required: numberRatingsRequired,
          active,
        },
        ['*']
      )
      .from('SEPs')
      .where('sep_id', id)
      .then((records: SEPRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`SEP not found ${id}`);
        }

        return createSEPObject(records[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from('SEPs')
      .where('sep_id', id)
      .first()
      .then((sep: SEPRecord) => {
        return sep ? createSEPObject(sep) : null;
      });
  }

  async getUserSepBySepId(userId: number, sepId: number): Promise<SEP | null> {
    const sepRecords = await database<SEPRecord>('SEPs')
      .select<SEPRecord>('SEPs.*')
      .leftJoin('SEP_Reviewers', 'SEP_Reviewers.sep_id', '=', 'SEPs.sep_id')
      .where('SEPs.sep_id', sepId)
      .andWhere((qb) => {
        qb.where('sep_chair_user_id', userId);
        qb.orWhere('sep_secretary_user_id', userId);
        qb.orWhere('SEP_Reviewers.user_id', userId);
      })
      .first();

    return sepRecords ? createSEPObject(sepRecords) : null;
  }

  async getUserSeps(userId: number, role: Role): Promise<SEP[]> {
    const qb = database<SEPRecord>('SEPs').select<SEPRecord[]>('SEPs.*');

    if (role.shortCode === Roles.SEP_CHAIR) {
      qb.where('sep_chair_user_id', userId);
    } else if (role.shortCode === Roles.SEP_SECRETARY) {
      qb.where('sep_secretary_user_id', userId);
      // Note: keep it in case we need it in the future
      // } else if (role.shortCode === Roles.SEP_REVIEWER) {
      //   qb.join(
      //     'SEP_Reviewers',
      //     'SEP_Reviewers.sep_id',
      //     '=',
      //     'SEPs.sep_id'
      //   ).where('SEP_Reviewers.user_id', userId);
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

  async getAll(
    active?: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('SEPs')
      .orderBy('sep_id', 'desc')
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
    proposalId: number,
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
      .andWhere('proposal_id', proposalId);

    return sepAssignments.map((sepAssignment) =>
      createSEPAssignmentObject(sepAssignment)
    );
  }

  async getSEPProposals(sepId: number, callId: number): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .select(['sp.*'])
      .from('SEP_Proposals as sp')
      .modify((query) => {
        query
          .join('proposals as p', {
            'p.proposal_id': 'sp.proposal_id',
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

  async getSEPProposal(
    sepId: number,
    proposalId: number
  ): Promise<SEPProposal | null> {
    const sepProposal: SEPProposalRecord = await database
      .select(['sp.*'])
      .from('SEP_Proposals as sp')
      .join('proposals as p', {
        'p.proposal_id': 'sp.proposal_id',
      })
      .where('sp.sep_id', sepId)
      .where('sp.proposal_id', proposalId)
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
        'sp.proposal_id',
        'sp.sep_id',
        'sp.sep_time_allocation',
        'ihp.submitted as instrument_submitted',
      ])
      .from('SEP_Proposals as sp')
      .join('instrument_has_proposals as ihp', {
        'sp.proposal_id': 'ihp.proposal_id',
      })
      .join('proposals as p', {
        'p.proposal_id': 'sp.proposal_id',
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

    const sep = await this.get(sepId);

    if (!sep) {
      throw new Error(`SEP not found ${sepId}`);
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
    const sep = await this.get(sepId);

    if (!sep) {
      throw new Error(`SEP not found ${sepId}`);
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
      throw new Error(`Role with short code ${shortCode} does not exist`);
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

  async getSEPByProposalId(proposalId: number): Promise<SEP | null> {
    return database
      .select()
      .from('SEPs as s')
      .join('SEP_Proposals as sp', { 's.sep_id': 'sp.sep_id' })
      .where('sp.proposal_id', proposalId)
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
          [isChairAssignment
            ? 'sep_chair_user_id'
            : 'sep_secretary_user_id']: args.userId,
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
        throw new Error(`Could not find role with short code ${shortCode}`);
      }

      await trx<RoleUserRecord>('role_user')
        .insert({
          role_id: roleRecord.role_id,
          user_id: args.userId,
        })
        .onConflict(['role_id', 'user_id'])
        .ignore();
    });

    const sepUpdated = await this.get(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async assignReviewersToSEP(args: AssignReviewersToSEPArgs): Promise<SEP> {
    await database<SEPReviewerRecord>('SEP_Reviewers').insert(
      args.memberIds.map((userId) => ({
        sep_id: args.sepId,
        user_id: userId,
      }))
    );

    const sepUpdated = await this.get(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${args.sepId}`);
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
        throw new Error(
          `Failed to remove sep member ${args.memberId} (${field}), sep id ${args.sepId}`
        );
      }
    } else {
      const updateResult = await database<SEPReviewerRecord>('SEP_Reviewers')
        .where('sep_id', args.sepId)
        .where('user_id', args.memberId)
        .del();

      if (!updateResult) {
        throw new Error(
          `Failed to remove sep member ${args.memberId}, sep id ${args.sepId}`
        );
      }
    }

    const sepUpdated = await this.get(args.sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async assignProposal(proposalId: number, sepId: number) {
    const result = await database.raw(
      `${database('SEP_Proposals').insert({
        proposal_id: proposalId,
        sep_id: sepId,
        call_id: database('proposals')
          .select('call_id')
          .where('proposal_id', proposalId),
      })} ON CONFLICT (sep_id, proposal_id) DO UPDATE SET date_assigned=NOW() RETURNING *`
    );

    if (result.rows?.length) {
      return new ProposalIdsWithNextStatus([proposalId]);
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    await database.transaction(async (trx) => {
      await trx('SEP_Proposals')
        .where('sep_id', sepId)
        .andWhere('proposal_id', proposalId)
        .del();

      await trx('SEP_Assignments')
        .where('sep_id', sepId)
        .andWhere('proposal_id', proposalId)
        .del();

      await trx('SEP_Reviews')
        .where('sep_id', sepId)
        .andWhere('proposal_id', proposalId)
        .del();
    });

    const sepUpdated = await this.get(sepId);

    if (!sepUpdated) {
      throw new Error(`SEP not found ${sepId}`);
    }

    return sepUpdated;
  }

  async assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberIds: number[]
  ) {
    await database.transaction(async (trx) => {
      await trx<SEPAssignmentRecord>('SEP_Assignments')
        .insert(
          memberIds.map((memberId) => ({
            proposal_id: proposalId,
            sep_member_user_id: memberId,
            sep_id: sepId,
          }))
        )
        .returning<SEPAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('SEP_Reviews')
        .insert(
          memberIds.map((memberId) => ({
            user_id: memberId,
            proposal_id: proposalId,
            status: ReviewStatus.DRAFT,
            sep_id: sepId,
          }))
        )
        .returning<ReviewRecord[]>(['*']);
    });

    const updatedSep = await this.get(sepId);

    if (updatedSep) {
      return updatedSep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeMemberFromSepProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ) {
    const memberRemovedFromProposal = await database('SEP_Assignments')
      .del()
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId)
      .andWhere('sep_member_user_id', memberId);

    const sepUpdated = await this.get(sepId);

    if (memberRemovedFromProposal && sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async updateTimeAllocation(
    sepId: number,
    proposalId: number,
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
      .where('proposal_id', proposalId);

    if (!updatedRecord) {
      throw new Error(
        `SEP_Proposal not found, sepId: ${sepId}, proposalId: ${proposalId}`
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
    proposalId: number
  ): Promise<boolean> {
    const record = await database<SEPRecord>('SEPs')
      .select<SEPRecord>(['SEPs.*'])
      .join('SEP_Proposals', 'SEP_Proposals.sep_id', '=', 'SEPs.sep_id')
      .where('SEP_Proposals.proposal_id', proposalId)
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
    const dataToUpsert = {
      proposal_id: saveSepMeetingDecisionInput.proposalId,
      comment_for_management: saveSepMeetingDecisionInput.commentForManagement,
      comment_for_user: saveSepMeetingDecisionInput.commentForUser,
      rank_order: saveSepMeetingDecisionInput.rankOrder,
      recommendation: saveSepMeetingDecisionInput.recommendation,
      submitted: saveSepMeetingDecisionInput.submitted,
      submitted_by: submittedBy,
    };

    const [sepMeetingDecisionRecord]: SepMeetingDecisionRecord[] = (
      await database.raw(
        `? ON CONFLICT (proposal_id)
        DO UPDATE SET
        comment_for_management = EXCLUDED.comment_for_management,
        comment_for_user = EXCLUDED.comment_for_user,
        rank_order = EXCLUDED.rank_order,
        recommendation = EXCLUDED.recommendation,
        submitted = EXCLUDED.submitted,
        submitted_by = EXCLUDED.submitted_by
        RETURNING *;`,
        [database('SEP_meeting_decisions').insert(dataToUpsert)]
      )
    ).rows;

    if (!sepMeetingDecisionRecord) {
      logger.logError('Could not update/insert sep meeting decision', {
        dataToUpsert,
      });

      throw new Error('Could not update/insert sep meeting decision');
    }

    return createSepMeetingDecisionObject(sepMeetingDecisionRecord);
  }

  async getProposalSepMeetingDecision(
    proposalId: number
  ): Promise<SepMeetingDecision | null> {
    return database
      .select()
      .from('SEP_meeting_decisions')
      .where('proposal_id', proposalId)
      .first()
      .then((sepMeetingDecisionRecord: SepMeetingDecisionRecord) => {
        return sepMeetingDecisionRecord
          ? createSepMeetingDecisionObject(sepMeetingDecisionRecord)
          : null;
      });
  }
}
