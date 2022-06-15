import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EsiResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateEsiMutation {
  @Mutation(() => EsiResponseWrap)
  createEsi(
    @Arg('scheduledEventId', () => Int) scheduledEventId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalEsi.createEsi(context.user, scheduledEventId),
      EsiResponseWrap
    );
  }
}
