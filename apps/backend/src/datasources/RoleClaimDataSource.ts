import { RoleClaim } from '../models/RoleClaim';

export interface RoleClaimDataSource {
  findByInviteId(invite_id: number): Promise<RoleClaim[]>;
  create(invite_id: number, role_id: number): Promise<RoleClaim>;
  deleteByInviteId(invite_id: number): Promise<boolean>;
}
