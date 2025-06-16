import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../datasources/RoleClaimDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus } from '../decorators';
import { ApplicationEventBus } from '../events';
import { Event } from '../events/event.enum';
import { Invite } from '../models/Invite';
import { rejection, Rejection } from '../models/Rejection';
import { Role } from '../models/Role';
import { SettingsId } from '../models/Settings';
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
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.EventBus) private eventBus: ApplicationEventBus
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
  @EventBus(Event.PROPOSAL_CO_PROPOSER_CLAIM_SENT)
  public async setCoProposerInvites(
    agent: UserWithRole | null,
    args: SetCoProposerInvitesInput
  ): Promise<Invite[] | Rejection> {
    const { proposalPk, emails } = args;
    const hasWriteRights =
      this.userAuth.isApiToken(agent) ||
      (await this.proposalAuth.hasWriteRights(agent, proposalPk));

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

    // Get invite validity period from settings
    const inviteValidityPeriodSetting = await this.adminDataSource.getSetting(
      SettingsId.INVITE_VALIDITY_PERIOD_DAYS
    );
    if (!inviteValidityPeriodSetting?.settingsValue) {
      return rejection('Invite validity period setting not found');
    }

    const validityPeriodDays = parseInt(
      inviteValidityPeriodSetting.settingsValue
    );
    if (isNaN(validityPeriodDays) || validityPeriodDays <= 0) {
      return rejection('Invalid invite validity period value');
    }

    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    const expirationDate = new Date(
      Date.now() + validityPeriodDays * MILLISECONDS_PER_DAY
    );

    const newInvites = await Promise.all(
      newEmails.map(async (email) =>
        this.inviteDataSource.create({
          createdByUserId: agent!.id,
          code: await this.generateInviteCode(),
          email: email,
          expiresAt: expirationDate,
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

      const invite = await this.inviteDataSource.findById(inviteId);

      this.eventBus.publish({
        type: Event.PROPOSAL_CO_PROPOSER_CLAIM_ACCEPTED,
        isRejection: false,
        key: 'proposal',
        loggedInUserId: claimerUserId,
        invite: invite!,
        description: `User with ID ${claimerUserId} accepted invite for proposal ${claim.proposalPk}`,
      });
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
