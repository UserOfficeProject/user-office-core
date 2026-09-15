import { Resolver, Query, Ctx, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role';

@Resolver()
export class RolesQuery {
  @Query(() => [Role], { nullable: true })
  roles(@Ctx() context: ResolverContext) {
    return context.queries.user.getRoles(context.user);
  }
}

@Resolver()
export class RolesByTagsQuery {
  @Query(() => [Role], { nullable: true })
  rolesByTags(
    @Ctx() context: ResolverContext,
    @Arg('tagIds', () => [Int!], { nullable: true }) tagIds: number[]
  ) {
    return context.queries.user.getRolesByTags(context.user, tagIds);
  }
}
