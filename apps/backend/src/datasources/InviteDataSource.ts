import { Invite } from '../models/Invite';

export interface GetInvitesFilter {
  isReminderEmailSent?: boolean;
  createdBefore?: Date;
  isClaimed?: boolean;
}

export interface InviteDataSource {
  create(args: {
    createdByUserId: number;
    code: string;
    email: string;
    expiresAt: Date | null;
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
    isReminderEmailSent?: boolean;
    expiresAt?: Date | null;
  }): Promise<Invite>;

  delete(id: number): Promise<void>;
}
