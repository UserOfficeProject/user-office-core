/* eslint-disable @typescript-eslint/camelcase */
import { Role } from '../../models/Role';
import { SEP, SEPAssignment, SEPMember } from '../../models/SEP';
import { AddSEPMembersRole } from '../../resolvers/mutations/AddSEPMembersRoleMutation';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import {
  SEPRecord,
  SEPAssignmentRecord,
  SEPMemberRecord,
  RoleRecord,
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

  async getAssignments(sepId: number): Promise<SEPAssignment[]> {
    const sepAssignments: SEPAssignmentRecord[] = await database
      .from('SEP_Assignments')
      .where('sep_id', sepId);

    return sepAssignments.map(sepAssignment =>
      this.createSEPAssignmentObject(sepAssignment)
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

  async addSEPMembersRoles(usersWithRoles: AddSEPMembersRole[]) {
    const rolesToInsert = usersWithRoles.map(userWithRole => {
      return {
        user_id: userWithRole.userID,
        role_id: userWithRole.roleID,
        sep_id: userWithRole.SEPID,
      };
    });

    await database('role_user')
      .del()
      .where('sep_id', rolesToInsert[0].sep_id)
      .whereIn('user_id', [...rolesToInsert.map(role => role.user_id)]);

    await database.insert(rolesToInsert).into('role_user');

    const sepUpdated = await this.get(rolesToInsert[0].sep_id);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${rolesToInsert[0].sep_id}`);
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
      `${database('SEP_Assignments').insert({
        proposal_id: proposalId,
        sep_id: sepId,
      })} ON CONFLICT (sep_id, proposal_id) DO UPDATE SET reassigned='true', date_reassigned=NOW()`
    );

    const sepUpdated = await this.get(sepId);

    if (sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    const assignmentRemoved = await database('SEP_Assignments')
      .del()
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId);

    const sepUpdated = await this.get(sepId);

    if (assignmentRemoved && sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ) {
    const assignmentUpdated = await database('SEP_Assignments')
      .update('sep_member_user_id', memberId)
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId);

    const sepUpdated = await this.get(sepId);

    if (assignmentUpdated && sepUpdated) {
      return sepUpdated;
    }

    throw new Error(`SEP not found ${sepId}`);
  }
}
