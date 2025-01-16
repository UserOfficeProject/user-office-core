import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';

export class AcceptInvite {
  @Mutation(() => Boolean)
  acceptInvite(@Arg('code') code: string, @Ctx() context: ResolverContext) {
    return context.mutations.invite.accept(context.user, code);
  }
}
