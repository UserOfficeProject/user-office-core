import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Instrument } from '../types/Instrument';

@Resolver()
export class InstrumentQuery {
  @Query(() => Instrument, { nullable: true })
  instrument(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.get(context.user, id);
  }

  @Query(() => Instrument, { nullable: true })
  instruments(@Ctx() context: ResolverContext) {
    return context.queries.instrument.getAll(context.user);
  }
}
