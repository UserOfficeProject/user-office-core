import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';

@ArgsType()
export class ProposalEmailEventArgs {
  @Field(() => String)
  public proposalId: string;

  @Field(() => Event)
  public event: Event;
}

@Resolver()
export class EventEmailMutation {
  @Mutation(() => Event)
  sendProposalEventEmail(
    @Args()
    args: ProposalEmailEventArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.sendEventEmail(context.user, args);
  }
}
