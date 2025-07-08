import { Invite } from '../models/Invite';

export interface GetInvitesFilter {
  createdBefore?: Date;
  createdAfter?: Date;
  isClaimed?: boolean;
  isExpired?: boolean;
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
  findCoProposerInvites(
    proposalPk: number,
    isClaimed?: boolean
  ): Promise<Invite[]>;
  getInvites(filter: GetInvitesFilter): Promise<Invite[]>;

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
