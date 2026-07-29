import { Invite } from '../models/Invite';

export interface GetInvitesFilter {
  createdBefore?: Date;
  createdAfter?: Date;
  isClaimed?: boolean;
  isExpired?: boolean;
  email?: string;
}

export interface GetProposalInvitesFilter extends GetInvitesFilter {
  proposalPk?: number;
}

export interface InviteDataSource {
  create(args: {
    createdByUserId: number;
    code: string;
    email: string;
    expiresAt: Date | null;
    templateId?: string | null;
  }): Promise<Invite>;

  findByCode(code: string): Promise<Invite | null>;
  findById(id: number): Promise<Invite | null>;
  /**
   * Invites attached to a proposal that are still waiting to be claimed. This
   * is the single definition of "pending invites on a proposal": the read path
   * shows exactly these, and the setXInvites mutations diff against exactly
   * these, so the two cannot drift apart.
   */
  findPendingCoProposerInvites(proposalPk: number): Promise<Invite[]>;
  findPendingDataAccessInvites(proposalPk: number): Promise<Invite[]>;
  findVisitRegistrationInvites(
    visitId: number,
    isClaimed?: boolean
  ): Promise<Invite[]>;
  getInvites(filter: GetInvitesFilter): Promise<Invite[]>;
  getCoProposerInvites(filter: GetProposalInvitesFilter): Promise<Invite[]>;
  getDataAccessInvites(filter: GetProposalInvitesFilter): Promise<Invite[]>;

  update(args: {
    id: number;
    code?: string;
    email?: string;
    note?: string;
    claimedAt?: Date | null;
    claimedByUserId?: number | null;
    isEmailSent?: boolean;
    expiresAt?: Date | null;
    templateId?: string | null;
  }): Promise<Invite>;

  delete(id: number): Promise<void>;
}
