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
import { Instrument } from '../types/Instrument';

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
  @Mutation(() => Instrument)
  async createInstrument(
    @Args() args: CreateInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.create(context.user, args);
  }
}
