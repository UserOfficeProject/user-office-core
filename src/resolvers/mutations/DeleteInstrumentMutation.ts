import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { InstrumentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteInstrumentMutation {
  @Mutation(() => InstrumentResponseWrap)
  async deleteInstrument(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.delete(context.user, { id }),
      InstrumentResponseWrap
    );
  }
}
