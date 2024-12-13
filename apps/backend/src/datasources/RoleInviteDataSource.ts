import { RoleInvite } from '../models/RoleInvite';

export interface RoleInviteDataSource {
  create(invite_code_id: number, role_id: number): Promise<RoleInvite>;
}
