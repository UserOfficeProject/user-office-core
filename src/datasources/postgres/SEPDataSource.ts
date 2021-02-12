/* eslint-disable @typescript-eslint/camelcase */
import { ProposalIds } from '../../models/Proposal';
import { ReviewStatus } from '../../models/Review';
import { Role } from '../../models/Role';
import { SEP, SEPAssignment, SEPMember, SEPProposal } from '../../models/SEP';
import { User } from '../../models/User';
import { AddSEPMembersRole } from '../../resolvers/mutations/AddSEPMembersRoleMutation';
import { UpdateMemberSEPArgs } from '../../resolvers/mutations/AssignMembersToSEP';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import {
  SEPRecord,
  SEPAssignmentRecord,
  RoleUserRecord,
  RoleRecord,
  SEPProposalRecord,
  ReviewRecord,
} from './records';

export default class PostgresSEPDataSource implements SEPDataSource {
  private createSEPObject(sep: SEPRecord) {
    return new SEP(
      sep.sep_id,
      sep.code,
      sep.description,
      sep.number_ratings_required,
      sep.active
    );
  }

  private createSEPProposalObject(sepAssignment: SEPProposalRecord) {
    return new SEPProposal(
      sepAssignment.proposal_id,
      sepAssignment.sep_id,
      sepAssignment.date_assigned,
      sepAssignment.sep_time_allocation,
      sepAssignment.instrument_submitted
    );
  }
  private createSEPAssignmentObject(sepAssignment: SEPAssignmentRecord) {
    return new SEPAssignment(
      sepAssignment.proposal_id,
      sepAssignment.sep_member_user_id,
      sepAssignment.sep_id,
      sepAssignment.date_assigned,
      sepAssignment.reassigned,
      sepAssignment.date_reassigned,
      sepAssignment.email_sent
    );
  }

  private createSEPMemberObject(sepMember: RoleUserRecord) {
    return new SEPMember(
      sepMember.role_user_id,
      sepMember.role_id,
      sepMember.user_id,
      sepMember.sep_id
    );
  }

  async isMemberOfSEP(agent: User | null, sepId: number) {
    if (agent == null) {
      return false;
    }

    return this.getUserSeps(agent.id).then(seps => {
      return seps.some(sepItem => sepItem.id === sepId);
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
      .then((resultSet: SEPRecord[]) => this.createSEPObject(resultSet[0]));
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

        return this.createSEPObject(records[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from('SEPs')
      .where('sep_id', id)
      .first()
      .then((sep: SEPRecord) => {
        return sep ? this.createSEPObject(sep) : null;
      });
  }

  async getUserSeps(id: number): Promise<SEP[]> {
    return database
      .select('ru.*', 's.*')
      .from('role_user as ru')
      .innerJoin('SEPs as s', {
        'ru.sep_id': 's.sep_id',
      })
      .where('ru.user_id', id)
      .groupBy('s.sep_id', 'ru.role_user_id')
      .then((allSeps: SEPRecord[]) =>
        allSeps.map(sep => this.createSEPObject(sep))
      );
  }

  async getAll(
    active: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('SEPs')
      .orderBy('sep_id', 'desc')
      .modify(query => {
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
        if (active) {
          query.where('active', active);
        }
      })
      .then((allSeps: SEPRecord[]) => {
        const seps = allSeps.map(sep => this.createSEPObject(sep));

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
      .modify(query => {
        if (reviewerId !== null) {
          query.where('sep_member_user_id', reviewerId);
        }
      })
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId);

    return sepAssignments.map(sepAssignment =>
      this.createSEPAssignmentObject(sepAssignment)
    );
  }

  async getSEPProposals(sepId: number, callId: number): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .select(['sp.*'])
      .from('SEP_Proposals as sp')
      .modify(query => {
        query
          .join('proposals as p', {
            'p.proposal_id': 'sp.proposal_id',
          })
          .join('proposal_statuses as ps', {
            'p.status_id': 'ps.proposal_status_id',
          })
          .where(function() {
            this.where('ps.name', 'ilike', 'SEP_%');
          });

        if (callId) {
          query.andWhere('p.call_id', callId);
        }
      })
      .where('sp.sep_id', sepId);

    return sepProposals.map(sepProposal =>
      this.createSEPProposalObject(sepProposal)
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
      .join('proposal_statuses as ps', {
        'p.status_id': 'ps.proposal_status_id',
      })
      .where(function() {
        this.where('ps.name', 'ilike', 'SEP_%');
      })
      .where('sp.sep_id', sepId)
      .where('sp.proposal_id', proposalId)
      .first();

    return sepProposal ? this.createSEPProposalObject(sepProposal) : null;
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

    return sepProposals.map(sepProposal =>
      this.createSEPProposalObject(sepProposal)
    );
  }

  async getMembers(sepId: number): Promise<SEPMember[]> {
    const sepMembers: RoleUserRecord[] = await database
      .from('role_user')
      .where('sep_id', sepId)
      .distinct(database.raw('ON (user_id) *'));

    return sepMembers.map(sepMember => this.createSEPMemberObject(sepMember));
  }

  async getSEPUserRoles(id: number, sepId: number): Promise<Role[]> {
    return database
      .select()
      .from('roles as r')
      .join('role_user as rc', { 'r.role_id': 'rc.role_id' })
      .join('users as u', { 'u.user_id': 'rc.user_id' })
      .where('u.user_id', id)
      .andWhere('rc.sep_id', sepId)
      .then((roles: RoleRecord[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async getSEPProposalUserRoles(
    id: number,
    proposalId: number
  ): Promise<Role[]> {
    return database
      .select()
      .from('roles as r')
      .join('role_user as rc', { 'r.role_id': 'rc.role_id' })
      .join('users as u', { 'u.user_id': 'rc.user_id' })
      .join('SEP_Proposals as sp', { 'sp.sep_id': 'rc.sep_id' })
      .where('u.user_id', id)
      .andWhere('sp.proposal_id', proposalId)
      .then((roles: RoleRecord[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
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
          return this.createSEPObject(sep);
        }

        return null;
      });
  }

  async addSEPMembersRole(usersWithRole: AddSEPMembersRole) {
    const rolesToInsert = usersWithRole.userIDs.map(userId => ({
      user_id: userId,
      role_id: usersWithRole.roleID,
      sep_id: usersWithRole.SEPID,
    }));

    await database('role_user')
      .del()
      .whereIn('user_id', usersWithRole.userIDs)
      .andWhere('sep_id', usersWithRole.SEPID)
      .andWhere('role_id', usersWithRole.roleID);

    await database.insert(rolesToInsert).into('role_user');

    const sepUpdated = await this.get(usersWithRole.SEPID);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${usersWithRole.SEPID}`);
  }

  async removeSEPMemberRole(args: UpdateMemberSEPArgs) {
    const memberRemoved = await database('role_user')
      .del()
      .where('sep_id', args.sepId)
      .andWhere('user_id', args.memberId)
      .andWhere('role_id', args.roleId);

    const sepUpdated = await this.get(args.sepId);

    if (memberRemoved && sepUpdated) {
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
      return new ProposalIds([proposalId]);
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    await database.transaction(async trx => {
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
    await database.transaction(async trx => {
      await trx<SEPAssignmentRecord>('SEP_Assignments')
        .insert(
          memberIds.map(memberId => ({
            proposal_id: proposalId,
            sep_member_user_id: memberId,
            sep_id: sepId,
          }))
        )
        .returning<SEPAssignmentRecord[]>(['*']);

      await trx<ReviewRecord>('SEP_Reviews')
        .insert(
          memberIds.map(memberId => ({
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

    return this.createSEPProposalObject(updatedRecord);
  }
}
