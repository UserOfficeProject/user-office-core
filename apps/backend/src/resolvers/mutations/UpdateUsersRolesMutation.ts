import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class UpdateUsersRolesArgs {
  @Field(() => [Int])
  public userIds: number[];

  @Field(() => [Int], { nullable: true })
  public roles: number[];
}

@Resolver()
export class UpdateUsersRolesMutation {
  @Mutation(() => Boolean)
  updateUsersRoles(
    @Args() args: UpdateUsersRolesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.addRolesToUsers(context.user, args);
  }
}

@Resolver()
export class RemoveUsersRolesMutation {
  @Mutation(() => Boolean)
  removeUsersRoles(
    @Args() args: UpdateUsersRolesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.removeRolesFromUsers(context.user, args);
  }
}
