import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InviteCodeDataSource } from '../datasources/InviteCodeDataSource';
import { RoleInviteDataSource } from '../datasources/RoleInviteDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { InviteCode } from '../models/InviteCode';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
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
    private roleInviteDataSource: RoleInviteDataSource
  ) {}

  // @ValidateArgs(createInviteValidationSchema)
  @Authorized([Roles.USER])
  async create(
    agent: UserWithRole | null,
    args: CreateInviteInput
  ): Promise<InviteCode | Rejection> {
    // TODO
    // Peform authrozation checks
    // Check if the user is allowed to create an invite with the given claims

    // Create Code
    const code = Math.random().toString(36).substr(2, 10).toUpperCase();
    const inviteCode = await this.inviteDataSource.create(
      agent!.id,
      code,
      args.email
    );

    await this.replaceRoleInvites(inviteCode.id, args.claims.roleIds);

    return inviteCode;
  }
  @Authorized()
  async accept(agent: UserWithRole | null, code: string): Promise<InviteCode> {
    const inviteCode = await this.inviteDataSource.findByCode(code);
    if (inviteCode === null) {
      throw new GraphQLError('Invite code not found');
    }

    await this.acceptRoleInvites(agent!.id, inviteCode.id);

    return inviteCode;
  }

  @Authorized([Roles.USER_OFFICER])
  async update(user: UserWithRole | null, input: UpdateInviteInput) {
    if (input.claims.roleIds && input.claims.roleIds.length > 0) {
      this.replaceRoleInvites(input.id, input.claims.roleIds);
    }

    const updatedInvite = await this.inviteDataSource.update(input);
    await this.replaceRoleInvites(updatedInvite.id, input.claims.roleIds);

    return updatedInvite;
  }

  private async replaceRoleInvites(
    inviteCodeId: number,
    roleIds: number[] | undefined
  ) {
    await this.roleInviteDataSource.deleteByInviteCodeId(inviteCodeId);

    if (!roleIds) return;

    for await (const roleId of roleIds) {
      await this.roleInviteDataSource.create(inviteCodeId, roleId);
    }
  }

  private async acceptRoleInvites(claimerUserId: number, inviteCodeId: number) {
    const roleInvites =
      await this.roleInviteDataSource.findByInviteCodeId(inviteCodeId);

    if (roleInvites.length > 0) {
      for await (const roleInvite of roleInvites) {
        await this.userDataSource.addUserRole({
          userID: claimerUserId,
          roleID: roleInvite.role_id,
        });
      }
    }
  }
}
