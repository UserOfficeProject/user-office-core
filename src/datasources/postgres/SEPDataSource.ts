/* eslint-disable @typescript-eslint/camelcase */
import { Role } from '../../models/Role';
import { SEP, SEPAssignment, SEPMember, SEPProposal } from '../../models/SEP';
import { AddSEPMembersRole } from '../../resolvers/mutations/AddSEPMembersRoleMutation';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import {
  SEPRecord,
  SEPAssignmentRecord,
  SEPMemberRecord,
  RoleRecord,
  SEPProposalRecord,
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
      sepAssignment.date_assigned
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

  private createSEPMemberObject(sepMember: SEPMemberRecord) {
    return new SEPMember(
      sepMember.role_user_id,
      sepMember.role_id,
      sepMember.user_id,
      sepMember.sep_id
    );
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
    proposalId: number
  ): Promise<SEPAssignment[]> {
    const sepAssignments: SEPAssignmentRecord[] = await database
      .from('SEP_Assignments')
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId);

    return sepAssignments.map(sepAssignment =>
      this.createSEPAssignmentObject(sepAssignment)
    );
  }

  async getSEPProposals(sepId: number): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .from('SEP_Proposals')
      .where('sep_id', sepId);

    return sepProposals.map(sepProposal =>
      this.createSEPProposalObject(sepProposal)
    );
  }

  async getSEPProposalsByInstrument(
    sepId: number,
    instrumentId: number
  ): Promise<SEPProposal[]> {
    const sepProposals: SEPProposalRecord[] = await database
      .select(['sp.proposal_id', 'sp.sep_id'])
      .from('SEP_Proposals as sp')
      .join('instrument_has_proposals as ihp', {
        'sp.proposal_id': 'ihp.proposal_id',
      })
      .where('sp.sep_id', sepId)
      .andWhere('ihp.instrument_id', instrumentId);

    return sepProposals.map(sepProposal =>
      this.createSEPProposalObject(sepProposal)
    );
  }

  async getMembers(sepId: number): Promise<SEPMember[]> {
    const sepAssignments: SEPMemberRecord[] = await database
      .from('role_user')
      .where('sep_id', sepId);

    return sepAssignments.map(sepMember =>
      this.createSEPMemberObject(sepMember)
    );
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

  async addSEPMembersRole(userWithRoles: AddSEPMembersRole) {
    const roleToInsert = {
      user_id: userWithRoles.userID,
      role_id: userWithRoles.roleID,
      sep_id: userWithRoles.SEPID,
    };

    await database('role_user')
      .del()
      .where('sep_id', roleToInsert.sep_id)
      .andWhere('role_id', roleToInsert.role_id);

    await database.insert(roleToInsert).into('role_user');

    const sepUpdated = await this.get(roleToInsert.sep_id);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${roleToInsert.sep_id}`);
  }

  async removeSEPMemberRole(memberId: number, sepId: number) {
    const memberRemoved = await database('role_user')
      .del()
      .where('sep_id', sepId)
      .andWhere('user_id', memberId);

    const sepUpdated = await this.get(sepId);

    if (memberRemoved && sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignProposal(proposalId: number, sepId: number) {
    // TODO: Revisit this later! Not sure if this is the correct way to do it but for now it is fine.
    await database.raw(
      `${database('SEP_Proposals').insert({
        proposal_id: proposalId,
        sep_id: sepId,
      })} ON CONFLICT (sep_id, proposal_id) DO UPDATE SET date_assigned=NOW()`
    );

    const sepUpdated = await this.get(sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    const proposalRemoved = await database('SEP_Proposals')
      .del()
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId);

    const sepUpdated = await this.get(sepId);

    if (proposalRemoved && sepUpdated) {
      // NOTE: Remove all member assignments to proposal when it is removed from SEP.
      await database('SEP_Assignments')
        .del()
        .where('sep_id', sepId)
        .andWhere('proposal_id', proposalId);

      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ) {
    const assignmentAdded = await database('SEP_Assignments').insert({
      proposal_id: proposalId,
      sep_member_user_id: memberId,
      sep_id: sepId,
    });

    const sepUpdated = await this.get(sepId);

    if (assignmentAdded && sepUpdated) {
      return sepUpdated;
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
}
