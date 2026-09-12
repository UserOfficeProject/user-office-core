import { DataAccessClaim } from '../models/DataAccessClaim';

export interface DataAccessClaimDataSource {
  create(inviteId: number, proposalPk: number): Promise<DataAccessClaim>;
  findByInviteId(inviteId: number): Promise<DataAccessClaim[]>;
}
