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
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => SuccessResponseWrap)
  async assignScientistsToInstrument(
    @Args() args: AssignScientistsToInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.assignScientsitsToInstrument(
        context.user,
        args
      ),
      SuccessResponseWrap
    );
  }

  @Mutation(() => SuccessResponseWrap)
  async removeScientistFromInstrument(
    @Args() args: RemoveScientistFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.instrument.removeScientistFromInstrument(
        context.user,
        args
      ),
      SuccessResponseWrap
    );
  }
}
