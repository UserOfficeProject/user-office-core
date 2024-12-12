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
import { GraphQLError } from 'graphql';
@injectable()
export default class InviteMutations {
  constructor(
    @inject(Tokens.InviteCodeDataSource)
    private dataSource: InviteCodeDataSource,
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
    const inviteCode = await this.dataSource.create(
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
}
