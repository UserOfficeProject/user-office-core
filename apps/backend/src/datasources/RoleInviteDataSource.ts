import { RoleInvite } from '../models/RoleInvite';

export interface RoleInviteDataSource {
  findByInviteCodeId(invite_code_id: number): Promise<RoleInvite[]>;
  create(invite_code_id: number, role_id: number): Promise<RoleInvite>;
  deleteByInviteCodeId(invite_code_id: number): Promise<boolean>;
}
