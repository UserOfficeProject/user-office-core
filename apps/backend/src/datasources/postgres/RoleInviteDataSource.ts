import { RoleInvite } from '../../models/RoleInvite';
import { RoleInviteDataSource } from '../RoleInviteDataSource';
import database from './database';
import { createRoleInviteObject, RoleInviteRecord } from './records';

export default class PostgresRoleInviteDataSource
  implements RoleInviteDataSource
{
  async create(invite_code_id: number, role_id: number): Promise<RoleInvite> {
    return database
      .insert({ invite_code_id, role_id })
      .into('role_invites')
      .returning('*')
      .then((records: RoleInviteRecord[]) =>
        createRoleInviteObject(records[0])
      );
  }

  async findByInviteCodeId(invite_code_id: number): Promise<RoleInvite[]> {
    return database
      .select('*')
      .from('role_invites')
      .where('invite_code_id', invite_code_id)
      .then((records: RoleInviteRecord[]) =>
        records.map(createRoleInviteObject)
      );
  }

  async deleteByInviteCodeId(invite_code_id: number): Promise<boolean> {
    return database('role_invites')
      .where('invite_code_id', invite_code_id)
      .del()
      .then(() => true);
  }
}
