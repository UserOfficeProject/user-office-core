import { container } from 'tsyringe';
import {
  Resolver,
  Query,
  Ctx,
  Field,
  InputType,
  Int,
  ArgsType,
  Args,
} from 'type-graphql';

import { CasbinService } from '../../casbin/casbinService';
import { ResolverContext } from '../../context';

export enum PermissionsActionEnum {
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

@InputType()
export class PermissionsResource {
  @Field()
  type: string;

  @Field(() => Int, { nullable: true })
  id?: number;
}

@ArgsType()
export class GetPermissionsArgs {
  @Field(() => PermissionsActionEnum)
  permissionsAction: PermissionsActionEnum;

  @Field(() => PermissionsResource)
  resource: PermissionsResource;
}

@Resolver()
export class GetPermissionsQuery {
  @Query(() => Boolean)
  async getPermissions(
    @Args() args: GetPermissionsArgs,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    if (!context.user || !context.user.currentRole) {
      return false;
    }

    const casbinService = container.resolve(CasbinService);

    const userCtx = {
      role: context.user.currentRole.shortCode,
    };

    const resourceCtx = {
      type: args.resource.type,
      id: args.resource.id,
    };

    return casbinService.enforce(userCtx, resourceCtx, args.permissionsAction);
  }
}
