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
import {
  InstrumentResponseWrap,
  SuccessResponseWrap,
} from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateInstrumentArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public description: string;
}

@ArgsType()
export class InstrumentAvailabilityTimeArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public availabilityTime: number;
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

  @Mutation(() => SuccessResponseWrap)
  async setInstrumentAvailabilityTime(
    @Args() args: InstrumentAvailabilityTimeArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.setAvailabilityTimeOnInstrument(
        context.user,
        args
      ),
      SuccessResponseWrap
    );
  }
}
