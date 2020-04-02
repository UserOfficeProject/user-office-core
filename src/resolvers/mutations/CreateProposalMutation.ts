import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/EventBusDecorator';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateProposalMutation {
  @EventBus(Event.PROPOSAL_CREATED)
  @Mutation(() => ProposalResponseWrap)
  createProposal(@Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.proposal.create(context.user),
      ProposalResponseWrap
    );
  }
}
