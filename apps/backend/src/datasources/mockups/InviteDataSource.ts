import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Invite } from '../../models/Invite';
import { CoProposerClaimDataSource } from '../CoProposerClaimDataSource';
import { GetInvitesFilter, InviteDataSource } from '../InviteDataSource';

@injectable()
export class InviteDataSourceMock implements InviteDataSource {
  private invites: Invite[];

  constructor(
    @inject(Tokens.CoProposerClaimDataSource)
    private coProposerDataSource: CoProposerClaimDataSource
  ) {
    this.init();
  }

  async findCoProposerInvites(proposalPk: number): Promise<Invite[]> {
    const coProposerClaims =
      await this.coProposerDataSource.findByProposalPk(proposalPk);

    const invites = await Promise.all(
      coProposerClaims.map((claim) => this.findById(claim.inviteId))
    );

    return invites.filter((invite) => invite !== null) as Invite[];
  }
  async findVisitRegistrationInvites(
    visitId: number,
    includeExpired: boolean
  ): Promise<Invite[]> {
    const invites = this.invites.filter(
      (invite) =>
        invite.id === visitId &&
        (includeExpired || !invite.expiresAt || invite.expiresAt > new Date())
    );

    return invites;
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
        new Date(),
        1,
        null,
        null,
        true,
        null,
        null
      ),
      new Invite(
        2,
        'claimed-invite-code',
        'test2@example.com',
        new Date(),
        2,
        null,
        1,
        true,
        null,
        'email-template'
      ),
      new Invite(
        3,
        'expired-invite-code',
        'test3@example.com',
        new Date(),
        3,
        new Date(),
        null,
        false,
        new Date('2022-01-01'),
        null
      ),
    ];
  }

  async findByCode(code: string): Promise<Invite | null> {
    return this.invites.find((invite) => invite.code === code) || null;
  }

  getInvites(filter: GetInvitesFilter): Promise<Invite[]> {
    return new Promise((resolve) => {
      const filteredInvites = this.invites.filter((invite) => {
        if (filter.createdBefore) {
          if (invite.createdAt >= filter.createdBefore) {
            return false;
          }
        }

        if (filter.createdAfter) {
          if (invite.createdAt <= filter.createdAfter) {
            return false;
          }
        }

        if (filter.isClaimed !== undefined) {
          if (invite.claimedAt === null && filter.isClaimed) {
            return false;
          }
          if (invite.claimedAt !== null && !filter.isClaimed) {
            return false;
          }
        }

        if (filter.isExpired) {
          if (invite.expiresAt && invite.expiresAt < new Date()) {
            return false;
          }
        }

        return true;
      });

      resolve(filteredInvites);
    });
  }

  async create(args: {
    code: string;
    email: string;
    note: string;
    createdByUserId: number;
    expiresAt: Date | null;
    template?: string | null;
  }): Promise<Invite> {
    const { code, email, createdByUserId, expiresAt, template } = args;

    const newInvite = new Invite(
      this.invites.length + 1, // Generate new ID
      code,
      email,
      new Date(),
      createdByUserId,
      null,
      null,
      false,
      expiresAt ?? null,
      template ?? null
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
    template?: string | null;
  }): Promise<Invite> {
    const invite = await this.findById(args.id);
    if (!invite) {
      throw new Error('Invite code not found');
    }

    Object.assign(invite, { ...args });

    return invite;
  }
}
