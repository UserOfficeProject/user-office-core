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
export class CreateInstrumentArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public description: string;

  @Field(() => Int)
  public managerUserId: number;
}

@Resolver()
export class CreateInstrumentMutation {
  @Mutation(() => InstrumentResponseWrap)
  async createInstrument(
    @Args() args: CreateInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.create(context.user, args),
      InstrumentResponseWrap
    );
  }
}
