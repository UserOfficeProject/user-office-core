import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

export class AcceptDataAccessInviteMutation {
  @Mutation(() => Invite)
  acceptDataAccessInvite(
    @Arg('proposalId') proposalId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.acceptDataAccessInvite(
      context.user,
      proposalId
    );
  }
}
