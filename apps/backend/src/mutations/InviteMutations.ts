import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { VisitAuthorization } from '../auth/VisitAuthorization';
import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import database from '../datasources/postgres/database';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../datasources/RoleClaimDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { VisitRegistrationClaimDataSource } from '../datasources/VisitRegistrationClaimDataSource';
import { Authorized } from '../decorators';
import { ApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
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
    @inject(Tokens.VisitRegistrationClaimDataSource)
    private visitRegistrationClaimDataSource: VisitRegistrationClaimDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.VisitAuthorization)
    private visitAuthorization: VisitAuthorization,
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.EventBus) private eventBus: ApplicationEventBus
  ) {}

  @Authorized()
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

    await this.processRoleClaims(agent!.id, invite);
    await this.processCoProposerClaims(agent!.id, invite);
    await this.processVisitRegistrationClaims(agent!.id, invite);

    const updatedInvite = await this.inviteDataSource.update({
      id: invite.id,
      claimedAt: new Date(),
      claimedByUserId: agent!.id,
    });

    return updatedInvite;
  }

  private async getCoProposerInvites(proposalPk: number): Promise<Invite[]> {
    const existingClaims =
      await this.coProposerClaimDataSource.findByProposalPk(proposalPk);

    const existingInvites = (await Promise.all(
      existingClaims.map((claim) =>
        this.inviteDataSource.findById(claim.inviteId)
      )
    )) as Invite[];

    return existingInvites;
  }

  @Authorized()
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

    const existingInvites = await this.getCoProposerInvites(proposalPk);
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

    const expirationDate = await this.getInviteExpirationDate();

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

    const invites = [
      ...existingInvites.filter((invite) => !deletedInvites.includes(invite)),
      ...newInvites,
    ];

    await this.eventBus.publish({
      type: Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED,
      array: invites,
      key: 'array',
      loggedInUserId: agent?.id,
      inputArgs: JSON.stringify(args),
      impersonatingUserId: agent ? agent.impersonatingUserId : null,
      proposalPKey: proposalPk,
    } as ApplicationEvent);

    return invites;
  }

  @Authorized()
  public async setVisitRegistrationInvites(
    agent: UserWithRole | null,
    args: { visitId: number; emails: string[] }
  ): Promise<Invite[] | Rejection> {
    const { visitId, emails } = args;

    const hasWriteRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitAuthorization.hasWriteRights(agent, visitId));

    if (!hasWriteRights) {
      return rejection(
        'User is not authorized to create invites for this visit'
      );
    }

    const existingInvites =
      await this.inviteDataSource.findVisitRegistrationInvites(visitId, false);

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

    const expirationDate = await this.getInviteExpirationDate();

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
        await this.visitRegistrationClaimDataSource.create(
          newInvite.id,
          visitId
        );
      })
    );

    const invites = [
      ...existingInvites.filter((invite) => !deletedInvites.includes(invite)),
      ...newInvites,
    ];

    const { primaryKey: proposalPk } =
      await this.proposalDataSource.getProposalByVisitId(visitId);

    await this.eventBus.publish({
      type: Event.PROPOSAL_VISIT_REGISTRATION_INVITES_UPDATED,
      array: invites,
      key: 'array',
      loggedInUserId: agent?.id,
      inputArgs: JSON.stringify(args),
      impersonatingUserId: agent ? agent.impersonatingUserId : null,
      proposalPKey: proposalPk,
    } as ApplicationEvent);

    return invites;
  }
  private async processRoleClaims(claimerUserId: number, invite: Invite) {
    const inviteId = invite.id;
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

  private async processCoProposerClaims(claimerUserId: number, invite: Invite) {
    const inviteId = invite.id;
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

      this.eventBus.publish({
        type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
        isRejection: false,
        key: 'proposal',
        loggedInUserId: claimerUserId,
        invite: invite,
        description: `User with ID ${claimerUserId} accepted invite for proposal ${claim.proposalPk}`,
        proposalPKey: claim.proposalPk,
      });
    }
  }
  private async processVisitRegistrationClaims(
    claimerUserId: number,
    invite: Invite
  ) {
    const inviteId = invite.id;
    const claims =
      await this.visitRegistrationClaimDataSource.findByInviteId(inviteId);

    for (const claim of claims) {
      const existingRegistration = await this.visitDataSource.getRegistration(
        claimerUserId,
        claim.visitId
      );

      if (existingRegistration) {
        return;
      }

      // Insert the user into the visits_has_users table to create a new visit registration
      await database('visits_has_users')
        .insert({
          visit_id: claim.visitId,
          user_id: claimerUserId,
          registration_questionary_id: null,
          starts_at: null,
          ends_at: null,
          // status will default to 'DRAFTED' as defined in the database schema
        })
        .onConflict(['user_id', 'visit_id'])
        .ignore();

      const proposal = await this.proposalDataSource.getProposalByVisitId(
        claim.visitId
      );

      this.eventBus.publish({
        type: Event.PROPOSAL_VISIT_REGISTRATION_INVITE_ACCEPTED,
        isRejection: false,
        key: 'proposal',
        loggedInUserId: claimerUserId,
        invite: invite,
        description: `User with ID ${claimerUserId} accepted visit invite`,
        proposalPKey: proposal.primaryKey,
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

  private readonly getInviteExpirationDate = async (): Promise<Date> => {
    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

    const inviteValidityPeriodSetting = await this.adminDataSource.getSetting(
      SettingsId.INVITE_VALIDITY_PERIOD_DAYS
    );
    if (!inviteValidityPeriodSetting?.settingsValue) {
      throw new GraphQLError('Invite validity period setting not found');
    }

    const validityPeriodDays = parseInt(
      inviteValidityPeriodSetting.settingsValue
    );
    if (isNaN(validityPeriodDays) || validityPeriodDays <= 0) {
      throw new GraphQLError('Invalid invite validity period value');
    }

    const expirationDate = new Date(
      Date.now() + validityPeriodDays * MILLISECONDS_PER_DAY
    );

    return expirationDate;
  };
}
