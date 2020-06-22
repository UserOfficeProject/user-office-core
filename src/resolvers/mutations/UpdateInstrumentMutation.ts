import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { InstrumentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateInstrumentArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class UpdateInstrumentMutation {
  @Mutation(() => InstrumentResponseWrap)
  async updateInstrument(
    @Args() args: UpdateInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.update(context.user, args),
      InstrumentResponseWrap
    );
  }
}
