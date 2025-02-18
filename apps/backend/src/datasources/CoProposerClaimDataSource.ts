import { CoProposerClaim } from '../models/CoProposerClaim';

export interface CoProposerClaimDataSource {
  create(inviteId: number, proposalPk: number): Promise<CoProposerClaim>;
  getByInviteId(inviteId: number): Promise<CoProposerClaim | null>;
  getByProposalPk(proposalPk: number): Promise<CoProposerClaim[]>;
}
