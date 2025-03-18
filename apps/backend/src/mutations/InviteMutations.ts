import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../datasources/RoleClaimDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { Invite } from '../models/Invite';
import { rejection, Rejection } from '../models/Rejection';
import { Role } from '../models/Role';
import { UserRole, UserWithRole } from '../models/User';
import { SetCoProposerInvitesInput } from '../resolvers/mutations/SetCoProposerInvitesMutation';

@injectable()
export default class InviteMutations {
  constructor(
    @inject(Tokens.InviteDataSource)
    private inviteDataSource: InviteDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.RoleClaimDataSource)
    private roleClaimDataSource: RoleClaimDataSource,
    @inject(Tokens.CoProposerClaimDataSource)
    private coProposerClaimDataSource: CoProposerClaimDataSource,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  @Authorized()
  @EventBus(Event.INVITE_ACCEPTED)
  async accept(
    agent: UserWithRole | null,
    code: string
  ): Promise<Invite | Rejection> {
    const invite = await this.inviteDataSource.findByCode(code);
    if (invite === null) {
      return rejection('Invite code not found', { invite: code });
    }

    if (invite.claimedByUserId !== null) {
      return rejection('Invite code already claimed', { invite: code });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return rejection('Invite code has expired', { invite: code });
    }

    await this.processRoleClaims(agent!.id, invite.id);
    await this.processCoProposerClaims(agent!.id, invite.id);

    const updatedInvite = await this.inviteDataSource.update({
      id: invite.id,
      claimedAt: new Date(),
      claimedByUserId: agent!.id,
    });

    return updatedInvite;
  }

  @Authorized()
  @EventBus(Event.EMAIL_INVITES)
  public async setCoProposerInvites(
    user: UserWithRole | null,
    args: SetCoProposerInvitesInput
  ): Promise<Invite[] | Rejection> {
    const { proposalPk, emails } = args;
    const hasWriteRights = await this.proposalAuth.hasWriteRights(
      user,
      proposalPk
    );

    if (!hasWriteRights) {
      return rejection(
        'User is not authorized to create invites for this proposal'
      );
    }

    const existingClaims =
      await this.coProposerClaimDataSource.findByProposalPk(proposalPk);
    const existingInvites = (await Promise.all(
      existingClaims.map((claim) =>
        this.inviteDataSource.findById(claim.inviteId)
      )
    )) as Invite[];
    const existingEmails = existingInvites.map((invite) => invite.email);

    const deletedEmails = existingEmails.filter(
      (email) => !emails.includes(email)
    );
    const newEmails = emails.filter((email) => !existingEmails.includes(email));

    const deletedInvites = existingInvites.filter((invite) =>
      deletedEmails.includes(invite.email)
    );

    await Promise.all(
      deletedInvites.map((invite) => this.inviteDataSource.delete(invite.id))
    );

    const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
    const newInvites = await Promise.all(
      newEmails.map(async (email) =>
        this.inviteDataSource.create({
          createdByUserId: user!.id,
          code: await this.generateInviteCode(),
          email: email,
          expiresAt: new Date(Date.now() + ONE_YEAR),
          note: '',
        })
      )
    );
    await Promise.all(
      newInvites.map(async (newInvite) => {
        await this.coProposerClaimDataSource.create(newInvite.id, proposalPk);
        await this.roleClaimDataSource.create(newInvite.id, UserRole.USER);
      })
    );

    return [
      ...existingInvites.filter((invite) => !deletedInvites.includes(invite)),
      ...newInvites,
    ];
  }

  private async processRoleClaims(claimerUserId: number, inviteId: number) {
    const roleClaims = await this.roleClaimDataSource.findByInviteId(inviteId);

    if (roleClaims.length > 0) {
      for await (const roleClaim of roleClaims) {
        const existingUserRoles: Role[] =
          await this.userDataSource.getUserRoles(claimerUserId);

        if (existingUserRoles.find((role) => role.id === roleClaim.roleId)) {
          continue;
        }

        await this.userDataSource.addUserRole({
          userID: claimerUserId,
          roleID: roleClaim.roleId,
        });
      }
    }
  }

  private async processCoProposerClaims(
    claimerUserId: number,
    inviteId: number
  ) {
    const coProposerClaim =
      await this.coProposerClaimDataSource.findByInviteId(inviteId);

    for await (const claim of coProposerClaim) {
      const proposalHasUser = await this.proposalHasUser(
        claim.proposalPk,
        claimerUserId
      );
      // already a co-proposer
      if (proposalHasUser) {
        return;
      }

      await this.proposalDataSource.addProposalUser(
        claim.proposalPk,
        claimerUserId
      );
    }
  }

  private async proposalHasUser(proposalPk: number, userId: number) {
    const proposalUsers =
      await this.userDataSource.getProposalUsers(proposalPk);

    return proposalUsers.some((user) => user.id === userId);
  }

  private async generateInviteCode(): Promise<string> {
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingInvite = await this.inviteDataSource.findByCode(code);
      if (!existingInvite) {
        isUnique = true;
      }
    }

    return code;
  }
}
