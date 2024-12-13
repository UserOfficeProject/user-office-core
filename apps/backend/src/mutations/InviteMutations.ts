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

    // Add RoleInvites
    const { roleIds } = args.claims;
    if (roleIds !== undefined && roleIds.length > 0) {
      for await (const roleId of roleIds) {
        await this.roleInviteDataSource.create(inviteCode.id, roleId);
      }
    }

    return inviteCode;
  }
  @Authorized()
  async accept(agent: UserWithRole | null, code: string): Promise<InviteCode> {
    const inviteCode = await this.inviteDataSource.findByCode(code);
    if (inviteCode === null) {
      throw new GraphQLError('Invite code not found');
    }

    await this.handleRoleInvites(agent!.id, inviteCode.id);

    return inviteCode;
  }

  @Authorized([Roles.USER_OFFICER])
  async update(user: UserWithRole | null, input: UpdateInviteInput) {
    const updatedInvite = await this.inviteDataSource.update(input);

    return updatedInvite;
  }

  private async handleRoleInvites(claimerUserId: number, inviteCodeId: number) {
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
