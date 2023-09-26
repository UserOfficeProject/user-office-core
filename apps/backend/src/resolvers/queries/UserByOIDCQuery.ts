import { Query, Arg, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';

@Resolver()
export class UserByOIDCQueryResolver {
  @Query(() => User, { nullable: true })
  userByOIDCSub(
    @Arg('oidcSub', () => String) oidcSub: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getByOidcSub(context.user, oidcSub);
  }
}
