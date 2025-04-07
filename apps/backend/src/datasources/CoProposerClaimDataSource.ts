import { CoProposerClaim } from '../models/CoProposerClaim';

export interface CoProposerClaimDataSource {
  create(inviteId: number, proposalPk: number): Promise<CoProposerClaim>;
  findByInviteId(inviteId: number): Promise<CoProposerClaim[]>;
  findByProposalPk(proposalPk: number): Promise<CoProposerClaim[]>;
}
