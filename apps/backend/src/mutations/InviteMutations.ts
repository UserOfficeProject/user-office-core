import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CoProposerInviteDataSource } from '../datasources/CoProposerInviteDataSource';
import { InviteCodeDataSource } from '../datasources/InviteCodeDataSource';
import { RoleInviteDataSource } from '../datasources/RoleInviteDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
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
    @inject(Tokens.RoleInviteDataSource)
    private roleInviteDataSource: RoleInviteDataSource,
    @inject(Tokens.CoProposerInviteDataSource)
    private coProposerInviteDataSource: CoProposerInviteDataSource
  ) {}

  async create(
    agent: UserWithRole | null,
    args: CreateInviteInput
  ): Promise<InviteCode | Rejection> {
    // Create Code
    const newCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    const newInvite = await this.inviteDataSource.create(
      agent!.id,
      newCode,
      args.email
    );

    const { roleIds, coProposerProposalId } = args.claims;

    await this.setRoleInvites(newInvite.id, roleIds);
    await this.setCoProposerInvites(newInvite.id, coProposerProposalId);

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
    // TODO: accept more claims in the invite such as "co-proposer"

    await this.inviteDataSource.update({
      id: inviteCode.id,
      claimedAt: new Date(),
      claimedByUserId: agent!.id,
    });

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  async update(user: UserWithRole | null, input: UpdateInviteInput) {
    const updatedInvite = await this.inviteDataSource.update(input);
    await this.setRoleInvites(updatedInvite.id, input.claims?.roleIds);

    return updatedInvite;
  }

  private async setRoleInvites(
    inviteCodeId: number,
    roleIds: number[] | undefined
  ) {
    await this.roleInviteDataSource.deleteByInviteCodeId(inviteCodeId);

    if (!roleIds) return;

    for await (const roleId of roleIds) {
      await this.roleInviteDataSource.create(inviteCodeId, roleId);
    }
  }

  private async setCoProposerInvites(invCodeId: number, proposalPk?: number) {
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
}
