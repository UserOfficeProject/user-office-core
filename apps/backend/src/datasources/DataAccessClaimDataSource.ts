import { DataAccessClaim } from '../models/DataAccessClaim';

// TODO: check for relation with DataAccessUserDataSource.ts
export interface DataAccessClaimDataSource {
  create(inviteId: number, proposalPk: number): Promise<DataAccessClaim>;
  findByInviteId(inviteId: number): Promise<DataAccessClaim[]>;
  findByProposalPk(proposalPk: number): Promise<DataAccessClaim[]>;
}
