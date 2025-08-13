import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

export class AcceptInvite {
  @Mutation(() => Invite)
  acceptInvite(@Arg('code') code: string, @Ctx() context: ResolverContext) {
    return context.mutations.invite.accept(context.user, code);
  }
}
