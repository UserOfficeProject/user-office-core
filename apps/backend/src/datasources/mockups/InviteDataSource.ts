import { Invite } from '../../models/Invite';
import { InviteDataSource } from '../InviteDataSource';

export class InviteDataSourceMock implements InviteDataSource {
  private invites: Invite[];

  constructor() {
    this.init();
  }
  async delete(id: number): Promise<void> {
    this.invites = this.invites.filter((invite) => invite.id !== id);
  }

  async findById(id: number): Promise<Invite | null> {
    return this.invites.find((invite) => invite.id === id) || null;
  }

  public init() {
    this.invites = [
      new Invite(
        1,
        'invite-code',
        'test1@example.com',
        'note1',
        new Date(),
        1,
        null,
        null,
        true,
        null
      ),
      new Invite(
        2,
        'claimed-invite-code',
        'test2@example.com',
        'note2',
        new Date(),
        2,
        null,
        1,
        true,
        null
      ),
      new Invite(
        3,
        'expired-invite-code',
        'test3@example.com',
        'note3',
        new Date(),
        3,
        new Date(),
        null,
        false,
        new Date('2022-01-01')
      ),
    ];
  }

  async findByCode(code: string): Promise<Invite | null> {
    return this.invites.find((invite) => invite.code === code) || null;
  }

  async create(args: {
    code: string;
    email: string;
    note: string;
    createdByUserId: number;
    expiresAt: Date | null;
  }): Promise<Invite> {
    const { code, email, createdByUserId, expiresAt } = args;

    const newInvite = new Invite(
      this.invites.length + 1, // Generate new ID
      code,
      email,
      '', // Default note to an empty string
      new Date(),
      createdByUserId,
      null,
      null,
      false,
      expiresAt ?? null
    );

    this.invites.push(newInvite);

    return newInvite;
  }

  async update(args: {
    id: number;
    code?: string;
    email?: string;
    note?: string;
    claimedAt?: Date | null;
    claimedByUserId?: number | null;
    isEmailSent?: boolean;
    expiresAt?: Date | null;
  }): Promise<Invite> {
    const invite = await this.findById(args.id);
    if (!invite) {
      throw new Error('Invite code not found');
    }

    Object.assign(invite, { ...args });

    return invite;
  }
}
