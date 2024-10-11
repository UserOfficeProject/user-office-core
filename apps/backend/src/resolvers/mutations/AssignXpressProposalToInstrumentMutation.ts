import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { AssignProposalsToInstrumentsArgs } from './AssignProposalsToInstrumentsMutation';

@Resolver()
export class AssignXpressProposalsToInstrumentsMutation {
  @Mutation(() => Boolean)
  async assignXpressProposalsToInstruments(
    @Args() args: AssignProposalsToInstrumentsArgs,
    @Ctx() context: ResolverContext
  ) {
    const res =
      await context.mutations.instrument.assignXpressProposalsToInstruments(
        context.user,
        args
      );

    return isRejection(res) ? res : true;
  }
}
