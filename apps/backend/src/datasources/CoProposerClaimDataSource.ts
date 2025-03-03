import { CoProposerClaim } from '../models/CoProposerClaim';

export interface CoProposerClaimDataSource {
  create(inviteId: number, proposalPk: number): Promise<CoProposerClaim>;
  findByInviteId(inviteId: number): Promise<CoProposerClaim | null>;
  findByProposalPk(proposalPk: number): Promise<CoProposerClaim[]>;
}
