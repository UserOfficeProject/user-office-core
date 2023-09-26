import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Instrument } from '../types/Instrument';

@Resolver()
export class DeleteInstrumentMutation {
  @Mutation(() => Instrument)
  async deleteInstrument(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.delete(context.user, { id });
  }
}
