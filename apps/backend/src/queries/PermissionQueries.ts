import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import {
  contextAttributeRegistry,
  functionRegistry,
} from '../auth/AuthRegistry';
import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class PermissionQueries {
  constructor(
    @inject(Tokens.CasbinService)
    public casbinService: CasbinService
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getAuthResourceMetadata(
    agent: UserWithRole | null,
    resourceType: string
  ) {
    const attributes = contextAttributeRegistry.get(resourceType) ?? [];
    const functions = Object.keys(functionRegistry.get(resourceType) ?? {});

    return {
      attributes,
      functions,
    };
  }
}
