import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class AssignScientistsToInstrumentArgs {
  @Field(() => [Int])
  public scientistIds: number[];

  @Field(() => Int)
  public instrumentId: number;
}

@ArgsType()
export class RemoveScientistFromInstrumentArgs {
  @Field(() => Int)
  public scientistId: number;

  @Field(() => Int)
  public instrumentId: number;
}

@Resolver()
export class AssignScientsitsToInstrumentMutation {
  @Mutation(() => Boolean)
  async assignScientistsToInstrument(
    @Args() args: AssignScientistsToInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.assignScientistsToInstrument(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async removeScientistFromInstrument(
    @Args() args: RemoveScientistFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.removeScientistFromInstrument(
      context.user,
      args
    );
  }
}
