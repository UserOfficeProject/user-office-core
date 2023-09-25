import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserRole } from '../../models/User';
import { BasicUserDetails } from '../types/BasicUserDetails';

@Resolver()
export class BasicUserDetailsQuery {
  @Query(() => BasicUserDetails, { nullable: true })
  basicUserDetails(
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getBasic(context.user, userId);
  }

  @Query(() => BasicUserDetails, { nullable: true })
  basicUserDetailsByEmail(
    @Arg('email', () => String) email: string,
    @Ctx() context: ResolverContext,
    @Arg('role', () => UserRole, { nullable: true }) role?: UserRole
  ) {
    return context.queries.user.getBasicUserDetailsByEmail(
      context.user,
      email,
      role
    );
  }
}
