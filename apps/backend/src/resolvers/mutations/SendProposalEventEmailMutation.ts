import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';

@ArgsType()
export class SendProposalEventEmailArgs {
  @Field(() => String)
  public proposalId: string;

  @Field(() => Event)
  public event: Event;
}

@Resolver()
export class SendProposalEventEmailMutation {
  @Mutation(() => Event)
  sendProposalEventEmail(
    @Args()
    args: SendProposalEventEmailArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.sendEventEmail(context.user, args);
  }
}
