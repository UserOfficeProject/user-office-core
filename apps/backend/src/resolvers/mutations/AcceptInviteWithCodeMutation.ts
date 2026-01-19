import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

export class AcceptInviteWithCodeMutation {
  @Mutation(() => Invite)
  acceptInviteWithCode(
    @Arg('code') code: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.acceptWithCode(context.user, code);
  }
}
