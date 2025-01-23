import { CoProposerInvite } from '../models/CoProposerInvite';

export interface CoProposerInviteDataSource {
  create(inviteCodeId: number, proposalPk: number): Promise<CoProposerInvite>;
  findByInviteCodeId(inviteCodeId: number): Promise<CoProposerInvite[]>;
}
