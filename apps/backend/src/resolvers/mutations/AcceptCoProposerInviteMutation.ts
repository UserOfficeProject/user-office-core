import { Arg, Ctx, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

export class AcceptCoProposerInviteMutation {
  @Mutation(() => Invite)
  acceptCoProposerInvite(
    @Arg('proposalId') proposalId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.acceptCoProposerInvite(
      context.user,
      proposalId
    );
  }
}
