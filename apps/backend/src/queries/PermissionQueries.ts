import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import { AuthRegistry } from '../auth/AuthRegistry';
import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class PermissionQueries {
  constructor(
    @inject(Tokens.CasbinService)
    public casbinService: CasbinService,
    @inject(Tokens.AuthRegistry)
    public authRegistry: AuthRegistry
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getAuthResourceMetadata(
    agent: UserWithRole | null,
    resourceType: string
  ) {
    const attributes =
      this.authRegistry.contextAttributes.get(resourceType) ?? [];
    const functions = Object.keys(
      this.authRegistry.functions.get(resourceType) ?? {}
    );

    return {
      attributes,
      functions,
    };
  }
}
