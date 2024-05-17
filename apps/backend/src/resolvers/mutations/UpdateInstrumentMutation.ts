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
import { isRejection } from '../../models/Rejection';
import { Instrument } from '../types/Instrument';

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

  @Field(() => Int)
  public managerUserId: number;
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

@ArgsType()
export class InstrumentSubmitArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public fapId: number;
}

@Resolver()
export class UpdateInstrumentMutation {
  @Mutation(() => Instrument)
  async updateInstrument(
    @Args() args: UpdateInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.update(context.user, args);
  }

  @Mutation(() => Boolean)
  async setInstrumentAvailabilityTime(
    @Args() args: InstrumentAvailabilityTimeArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.setAvailabilityTimeOnInstrument(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async submitInstrument(
    @Args() args: InstrumentSubmitArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.instrument.submitInstrument(
      context.user,
      args
    );

    return isRejection(res) ? res : true;
  }

  @Mutation(() => Boolean)
  async unsubmitInstrument(
    @Args() args: InstrumentSubmitArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.instrument.unsubmitInstrument(
      context.user,
      args
    );

    return isRejection(res) ? res : true;
  }
}
