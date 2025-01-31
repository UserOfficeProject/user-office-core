import {
  createInviteValidationSchema,
  updateInviteValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { InviteAuthorization } from '../auth/InviteAuthorizer';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../datasources/RoleClaimDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Invite } from '../models/Invite';
import { rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateInviteInput } from '../resolvers/mutations/CreateInviteMutation';
import { SetCoProposerInvitesInput } from '../resolvers/mutations/SetCoProposerInvitesMutation';
import { UpdateInviteInput } from '../resolvers/mutations/UpdateInviteMutation';

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
    @inject(Tokens.InviteAuthorization)
    private inviteAuth: InviteAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  @Authorized()
  @ValidateArgs(createInviteValidationSchema)
  @Authorized()
  @ValidateArgs(createInviteValidationSchema)
  @EventBus(Event.EMAIL_INVITE)
  async create(
    agent: UserWithRole | null,
    args: CreateInviteInput
  ): Promise<Invite | Rejection> {
    const claims = args.claims;

    const hasCreateRights = await this.inviteAuth.hasCreateRights(
      agent,
      claims
    );
    if (hasCreateRights === false) {
      return rejection(
        'User is not authorized to create invites with these claims'
      );
    }

    const newCode = this.createInviteCode();
    const newInvite = await this.inviteDataSource.create(
      agent!.id,
      newCode,
      args.email
    );

    if (claims.roleIds) {
      await this.setRoleClaims(newInvite.id, claims.roleIds);
    }

    if (claims.coProposerProposalPk) {
      await this.setCoProposerClaims(newInvite.id, claims.coProposerProposalPk);
    }

    return newInvite;
  }

  @Authorized()
  async accept(
    agent: UserWithRole | null,
    code: string
  ): Promise<boolean | Rejection> {
    const invite = await this.inviteDataSource.findByCode(code);
    if (invite === null) {
      return rejection('Invite code not found', { invite: code });
    }

    if (invite.claimedByUserId !== null) {
      return rejection('Invite code already claimed', { invite: code });
    }

    await this.processRoleClaims(agent!.id, invite.id);
    await this.processCoProposerClaims(agent!.id, invite.id);

    await this.inviteDataSource.update({
      id: invite.id,
      claimedAt: new Date(),
      claimedByUserId: agent!.id,
    });

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(updateInviteValidationSchema)
  async update(
    agent: UserWithRole | null,
    args: UpdateInviteInput
  ): Promise<Invite | Rejection> {
    // Update is only allowed for user officers
    const updatedInvite = await this.inviteDataSource.update(args);

    if (args.claims) {
      if (args.claims.roleIds) {
        await this.setRoleClaims(args.id, args.claims.roleIds);
      }

      if (args.claims.coProposerProposalPk) {
        await this.setCoProposerClaims(
          args.id,
          args.claims.coProposerProposalPk
        );
      }
    }

    return updatedInvite;
  }

  @Authorized()
  @EventBus(Event.EMAIL_INVITES)
  public async setCoProposerInvites(
    user: UserWithRole | null,
    args: SetCoProposerInvitesInput
  ): Promise<Invite[] | Rejection> {
    const { proposalPk, emails } = args;
    const isAuthorizedToCreateInvites = await this.proposalAuth.hasWriteRights(
      user,
      proposalPk
    );

    if (!isAuthorizedToCreateInvites) {
      return rejection(
        'User is not authorized to create invites for this proposal'
      );
    }

    const existingClaims =
      await this.coProposerClaimDataSource.getByProposalPk(proposalPk);
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
    const newInvites = await Promise.all(
      newEmails.map((email) =>
        this.inviteDataSource.create(user!.id, this.createInviteCode(), email)
      )
    );
    await Promise.all(
      newInvites.map((invite) =>
        this.coProposerClaimDataSource.create(invite.id, proposalPk)
      )
    );

    return [
      ...existingInvites.filter((invite) => !deletedInvites.includes(invite)),
      ...newInvites,
    ];
  }

  private async setRoleClaims(inviteId: number, roleIds: number[]) {
    await this.roleClaimDataSource.deleteByInviteId(inviteId);

    if (!roleIds) return;

    if (roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) =>
          this.roleClaimDataSource.create(inviteId, roleId)
        )
      );
    }
  }

  private async setCoProposerClaims(inviteId: number, proposalPk: number) {
    await this.coProposerClaimDataSource.create(inviteId, proposalPk);
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
      await this.coProposerClaimDataSource.getByInviteId(inviteId);

    if (coProposerClaim === null) {
      return;
    }

    const proposalHasUser = await this.proposalHasUser(
      coProposerClaim.proposalPk,
      claimerUserId
    );
    // already a co-proposer
    if (proposalHasUser) {
      return;
    }

    await this.proposalDataSource.addProposalUser(
      coProposerClaim.proposalPk,
      claimerUserId
    );
  }

  private async proposalHasUser(proposalPk: number, userId: number) {
    const proposalUsers =
      await this.userDataSource.getProposalUsers(proposalPk);

    return proposalUsers.some((user) => user.id === userId);
  }

  private createInviteCode() {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }
}
