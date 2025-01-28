import {
  createInviteValidationSchema,
  updateInviteValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { InviteAuthorization } from '../auth/InviteAuthorizer';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../datasources/RoleClaimDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Invite } from '../models/Invite';
import { rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateInviteInput } from '../resolvers/mutations/CreateInviteMutation';
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
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.InviteAuthorization)
    private inviteAuth: InviteAuthorization
  ) {}

  @Authorized()
  @ValidateArgs(createInviteValidationSchema)
  async create(
    agent: UserWithRole | null,
    args: CreateInviteInput
  ): Promise<Invite | Rejection> {
    const { roleIds, coProposerProposalPk } = args.claims;

    const isRoleClaimAuthorized = await this.inviteAuth.isRoleClaimAuthorized(
      agent,
      roleIds
    );
    if (isRoleInviteAuthorized === false) {
      return rejection(
        'User is not authorized to create invites to this user type',
        { userId: agent?.id, roleIds }
      );
    }

    const isCoProposerInviteAuthorized =
      coProposerProposalPk === undefined ||
      this.userAuth.isUserOfficer(agent) ||
      (await this.proposalAuth.isMemberOfProposal(agent, coProposerProposalPk));

    if (isCoProposerInviteAuthorized === false) {
      return rejection(
        'User is not authorized to create invites to this proposal',
        { userId: agent?.id, proposalPk: coProposerProposalPk }
      );
    }

    const newCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    const newInvite = await this.inviteDataSource.create(
      agent!.id,
      newCode,
      args.email
    );

    if (roleIds) {
      await this.setRoleClaims(newInvite.id, roleIds);
    }
    if (coProposerProposalPk) {
      await this.setCoProposerClaims(newInvite.id, coProposerProposalPk);
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
  async update(agent: UserWithRole | null, args: UpdateInviteInput) {
    const { roleIds, coProposerProposalPk } = args.claims ?? {};

    const isRoleClaimAuthorized = await this.inviteAuth.isRoleClaimAuthorized(
      agent,
      roleIds
    );
    if (isRoleClaimAuthorized === false) {
      return rejection(
        'User is not authorized to update invites to this user type',
        { userId: agent?.id, roleIds }
      );
    }

    const isCoProposerClaimAuthorized =
      coProposerProposalPk === undefined ||
      (await this.proposalAuth.isMemberOfProposal(agent, coProposerProposalPk));

    if (isCoProposerClaimAuthorized === false) {
      return rejection(
        'User is not authorized to update invites to this proposal',
        { userId: agent?.id, proposalPk: coProposerProposalPk }
      );
    }

    const updatedInvite = await this.inviteDataSource.update(args);
    if (args.claims?.roleIds) {
      await this.setRoleClaims(updatedInvite.id, args.claims?.roleIds);
    }
    if (args.claims?.coProposerProposalPk) {
      await this.setCoProposerClaims(
        updatedInvite.id,
        args.claims.coProposerProposalPk
      );
    }

    return updatedInvite;
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

  private async setCoProposerClaims(invCodeId: number, proposalPk: number) {
    if (!proposalPk) return;

    return this.coProposerClaimDataSource.create(invCodeId, proposalPk);
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
}
