import { Resolver, Query, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role';

@Resolver()
export class RolesQuery {
  @Query(() => [Role], { nullable: true })
  roles(@Ctx() context: ResolverContext) {
    return context.queries.user.getRoles(context.user);
  }
}
