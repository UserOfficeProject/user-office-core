import { RoleClaim } from '../../models/RoleClaim';
import { RoleClaimDataSource } from '../RoleClaimDataSource';
import database from './database';
import { createRoleClaimObject, RoleClaimRecord } from './records';

export default class PostgresRoleClaimDataSource
  implements RoleClaimDataSource
{
  async create(invite_code_id: number, role_id: number): Promise<RoleClaim> {
    return database
      .insert({ invite_code_id, role_id })
      .into('role_invites')
      .returning('*')
      .then((records: RoleClaimRecord[]) =>
        createRoleClaimObject(records[0])
      );
  }

  async findByInviteId(invite_code_id: number): Promise<RoleClaim[]> {
    return database
      .select('*')
      .from('role_invites')
      .where('invite_code_id', invite_code_id)
      .then((records: RoleClaimRecord[]) =>
        records.map(createRoleClaimObject)
      );
  }

  async deleteByInviteId(invite_code_id: number): Promise<boolean> {
    return database('role_invites')
      .where('invite_code_id', invite_code_id)
      .del()
      .then(() => true);
  }
}
