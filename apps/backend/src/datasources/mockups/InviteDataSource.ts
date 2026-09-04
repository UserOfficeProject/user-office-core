import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { EmailTemplateId } from '../../eventHandlers/email/emailTemplateId';
import { Invite } from '../../models/Invite';
import {
  GetProposalInvitesFilter,
  GetInvitesFilter,
  InviteDataSource,
} from '../InviteDataSource';
import { CoProposerClaimDataSourceMock } from './CoProposerClaimDataSource';
import { DataAccessClaimDataSourceMock } from './DataAccessClaimDataSource';

@injectable()
export class InviteDataSourceMock implements InviteDataSource {
  private invites: Invite[];

  constructor(
    @inject(Tokens.CoProposerClaimDataSource)
    private coProposerDataSource: CoProposerClaimDataSourceMock,
    @inject(Tokens.DataAccessClaimDataSource)
    private dataAccessDataSource: DataAccessClaimDataSourceMock
  ) {
    this.init();
  }

  async findPendingCoProposerInvites(proposalPk: number): Promise<Invite[]> {
    return this.getCoProposerInvites({ proposalPk, isClaimed: false });
  }

  async findPendingDataAccessInvites(proposalPk: number): Promise<Invite[]> {
    return this.getDataAccessInvites({ proposalPk, isClaimed: false });
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
        EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_USER
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
        EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER
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
        EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_REVIEWER
      ),
      new Invite(
        4,
        'data-invite',
        'test_dau@example.com',
        new Date(),
        3,
        null,
        null,
        false,
        null,
        EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_DATA_ACCESS_USER
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

        if (filter.isExpired !== undefined) {
          const isExpired =
            invite.expiresAt !== null && invite.expiresAt < new Date();

          if (isExpired !== filter.isExpired) {
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
    templateId?: EmailTemplateId | null;
  }): Promise<Invite> {
    const { code, email, createdByUserId, expiresAt, templateId } = args;

    const newInvite = new Invite(
      // Sequential from the highest id ever used: length + 1 hands out an id
      // that is already taken once anything has been deleted
      Math.max(0, ...this.invites.map((invite) => invite.id)) + 1,
      code,
      email,
      new Date(),
      createdByUserId,
      null,
      null,
      false,
      expiresAt ?? null,
      templateId ?? (null as EmailTemplateId | null)
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
    templateId?: string | null;
  }): Promise<Invite> {
    const invite = await this.findById(args.id);
    if (!invite) {
      throw new Error('Invite code not found');
    }

    Object.assign(invite, { ...args });

    return invite;
  }

  async getCoProposerInvites(
    filter: GetProposalInvitesFilter
  ): Promise<Invite[]> {
    const inviteIdsOnProposal = filter.proposalPk
      ? (
          await this.coProposerDataSource.findByProposalPk(filter.proposalPk)
        ).map((claim) => claim.inviteId)
      : null;

    return this.invites.filter((invite) => {
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

      if (filter.isExpired !== undefined) {
        const isExpired =
          invite.expiresAt !== null && invite.expiresAt < new Date();

        if (isExpired !== filter.isExpired) {
          return false;
        }
      }

      if (filter.email) {
        if (invite.email !== filter.email) {
          return false;
        }
      }

      if (inviteIdsOnProposal && !inviteIdsOnProposal.includes(invite.id)) {
        return false;
      }

      return true;
    });
  }

  async getDataAccessInvites(
    filter: GetProposalInvitesFilter
  ): Promise<Invite[]> {
    const inviteIdsOnProposal = filter.proposalPk
      ? (
          await this.dataAccessDataSource.findByProposalPk(filter.proposalPk)
        ).map((claim) => claim.inviteId)
      : null;

    return this.invites.filter((invite) => {
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

      if (filter.isExpired !== undefined) {
        const isExpired =
          invite.expiresAt !== null && invite.expiresAt < new Date();

        if (isExpired !== filter.isExpired) {
          return false;
        }
      }

      if (filter.email) {
        if (invite.email !== filter.email) {
          return false;
        }
      }

      if (inviteIdsOnProposal && !inviteIdsOnProposal.includes(invite.id)) {
        return false;
      }

      return true;
    });
  }
}
