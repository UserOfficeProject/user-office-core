import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { InviteCode } from '../types/Invite';

export class AcceptInvite {
  @Mutation(() => InviteCode)
  acceptInvite(@Arg('code') code: string, @Ctx() context: ResolverContext) {
    return context.mutations.invite.accept(context.user, code);
  }
}
