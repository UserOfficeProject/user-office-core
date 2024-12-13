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
}
