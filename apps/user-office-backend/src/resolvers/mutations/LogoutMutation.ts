import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class LogoutMutation {
  @Mutation(() => String)
  logout(@Arg('token') token: string, @Ctx() context: ResolverContext) {
    return context.mutations.user.logout(token);
  }
}
