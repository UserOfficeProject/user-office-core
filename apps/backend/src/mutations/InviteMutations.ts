import {
  createInviteValidationSchema,
  updateInviteValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { InviteAuthorization } from '../auth/InviteAuthorizer';
import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CoProposerInviteDataSource } from '../datasources/CoProposerInviteDataSource';
import { InviteCodeDataSource } from '../datasources/InviteCodeDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleInviteDataSource } from '../datasources/RoleInviteDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { InviteCode } from '../models/InviteCode';
import { rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateInviteInput } from '../resolvers/mutations/CreateInviteMutation';
import { UpdateInviteInput } from '../resolvers/mutations/UpdateInviteMutation';

@injectable()
export default class InviteMutations {
  constructor(
    @inject(Tokens.InviteCodeDataSource)
    private inviteDataSource: InviteCodeDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.RoleInviteDataSource)
    private roleInviteDataSource: RoleInviteDataSource,
    @inject(Tokens.CoProposerInviteDataSource)
    private coProposerInviteDataSource: CoProposerInviteDataSource,
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
  ): Promise<InviteCode | Rejection> {
    const { roleIds, coProposerProposalPk } = args.claims;

    const isRoleInviteAuthorized = await this.inviteAuth.isRoleInviteAuthorized(
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
      await this.setRoleInvites(newInvite.id, roleIds);
    }
    if (coProposerProposalPk) {
      await this.setCoProposerInvites(newInvite.id, coProposerProposalPk);
    }

    return newInvite;
  }

  @Authorized()
  async accept(
    agent: UserWithRole | null,
    code: string
  ): Promise<boolean | Rejection> {
    const inviteCode = await this.inviteDataSource.findByCode(code);
    if (inviteCode === null) {
      return rejection('Invite code not found', { inviteCode: code });
    }

    if (inviteCode.claimedByUserId !== null) {
      return rejection('Invite code already claimed', { inviteCode: code });
    }

    await this.acceptRoleInvites(agent!.id, inviteCode.id);
    await this.acceptCoProposerInvites(agent!.id, inviteCode.id);

    await this.inviteDataSource.update({
      id: inviteCode.id,
      claimedAt: new Date(),
      claimedByUserId: agent!.id,
    });

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(updateInviteValidationSchema)
  async update(agent: UserWithRole | null, args: UpdateInviteInput) {
    const { roleIds, coProposerProposalPk } = args.claims ?? {};

    const isRoleClaimAuthorized = await this.inviteAuth.isRoleInviteAuthorized(
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
      await this.setRoleInvites(updatedInvite.id, args.claims?.roleIds);
    }
    if (args.claims?.coProposerProposalPk) {
      await this.setCoProposerInvites(
        updatedInvite.id,
        args.claims.coProposerProposalPk
      );
    }

    return updatedInvite;
  }

  private async setRoleInvites(inviteCodeId: number, roleIds: number[]) {
    await this.roleInviteDataSource.deleteByInviteCodeId(inviteCodeId);

    if (!roleIds) return;

    if (roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) =>
          this.roleInviteDataSource.create(inviteCodeId, roleId)
        )
      );
    }
  }

  private async setCoProposerInvites(invCodeId: number, proposalPk: number) {
    if (!proposalPk) return;

    return this.coProposerInviteDataSource.create(invCodeId, proposalPk);
  }

  private async acceptRoleInvites(claimerUserId: number, inviteCodeId: number) {
    const roleInvites =
      await this.roleInviteDataSource.findByInviteCodeId(inviteCodeId);

    if (roleInvites.length > 0) {
      for await (const roleInvite of roleInvites) {
        const existingUserRoles: Role[] =
          await this.userDataSource.getUserRoles(claimerUserId);

        if (existingUserRoles.find((role) => role.id === roleInvite.roleId)) {
          continue;
        }

        await this.userDataSource.addUserRole({
          userID: claimerUserId,
          roleID: roleInvite.roleId,
        });
      }
    }
  }

  private async acceptCoProposerInvites(
    claimerUserId: number,
    inviteCodeId: number
  ) {
    const coProposerInvite =
      await this.coProposerInviteDataSource.findByInviteCodeId(inviteCodeId);

    if (coProposerInvite === null) {
      return;
    }

    const proposalHasUser = await this.proposalHasUser(
      coProposerInvite.proposalPk,
      claimerUserId
    );
    // already a co-proposer
    if (proposalHasUser) {
      return;
    }

    await this.proposalDataSource.addProposalUser(
      coProposerInvite.proposalPk,
      claimerUserId
    );
  }

  private async proposalHasUser(proposalPk: number, userId: number) {
    const proposalUsers =
      await this.userDataSource.getProposalUsers(proposalPk);

    return proposalUsers.some((user) => user.id === userId);
  }
}
