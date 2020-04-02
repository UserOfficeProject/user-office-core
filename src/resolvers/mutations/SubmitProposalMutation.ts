import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/EventBusDecorator';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class SubmitProposalMutation {
  @EventBus(Event.PROPOSAL_SUBMITTED)
  @Mutation(() => ProposalResponseWrap)
  submitProposal(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.submit(context.user, id),
      ProposalResponseWrap
    );
  }
}
