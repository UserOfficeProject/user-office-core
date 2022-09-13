import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.get(context.user, userId);
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: ResolverContext) {
    return context.queries.user.me(context.user);
  }
}
