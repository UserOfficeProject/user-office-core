import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import { AuthRegistry, ResourceType } from '../auth/AuthRegistry';
import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { AuthResourceMetadata } from '../resolvers/queries/PermissionsQuery';

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
    resourceType: ResourceType
  ): Promise<AuthResourceMetadata> {
    const userAttributes =
      this.authRegistry.uiContextAttributes.get(ResourceType.USER) ?? [];
    const resourceAttributes =
      this.authRegistry.uiContextAttributes.get(resourceType) ?? [];
    const resourceFunctions = Object.keys(
      this.authRegistry.functions[resourceType] ?? {}
    );

    return {
      userAttributes,
      resourceAttributes,
      resourceFunctions,
    };
  }
}
