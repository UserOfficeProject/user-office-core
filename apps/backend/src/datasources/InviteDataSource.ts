import { Invite } from '../models/Invite';

export interface InviteDataSource {
  create(args: {
    code: string;
    email: string;
    note: string;
    createdByUserId: number;
    expiresAt: Date | null;
  }): Promise<Invite>;

  findByCode(code: string): Promise<Invite | null>;
  findById(id: number): Promise<Invite | null>;

  update(args: {
    id: number;
    code?: string;
    email?: string;
    note?: string;
    claimedAt?: Date | null;
    claimedByUserId?: number | null;
    isEmailSent?: boolean;
    expiresAt?: Date | null;
  }): Promise<Invite>;

  delete(id: number): Promise<void>;
}
