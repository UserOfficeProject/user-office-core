import { RoleClaim } from '../../models/RoleClaim';
import { RoleClaimDataSource } from '../RoleClaimDataSource';
import database from './database';
import { createRoleClaimObject, RoleClaimRecord } from './records';

export default class PostgresRoleClaimDataSource
  implements RoleClaimDataSource
{
  async create(invite_id: number, role_id: number): Promise<RoleClaim> {
    return database
      .insert({ invite_id, role_id })
      .into('role_claims')
      .returning('*')
      .then((records: RoleClaimRecord[]) => createRoleClaimObject(records[0]));
  }

  async findByInviteId(invite_id: number): Promise<RoleClaim[]> {
    return database
      .select('*')
      .from('role_claims')
      .where('invite_id', invite_id)
      .then((records: RoleClaimRecord[]) => records.map(createRoleClaimObject));
  }

  async deleteByInviteId(invite_id: number): Promise<boolean> {
    return database('role_claims')
      .where('invite_id', invite_id)
      .del()
      .then(() => true);
  }
}
