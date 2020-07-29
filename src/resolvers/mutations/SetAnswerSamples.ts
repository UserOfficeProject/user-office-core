import {
  Args,
  Ctx,
  Mutation,
  Resolver,
  ArgsType,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { wrapResponse } from '../wrapResponse';
import { SamplesResponseWrap } from '../types/CommonWrappers';

@ArgsType()
export class SetAnswerSamplesArgs {
  @Field(() => Int!)
  answerId: number;

  @Field(() => [Int!]!)
  sampleIds: number[];
}

@Resolver()
export class SetAnswerSamples {
  @Mutation(() => SamplesResponseWrap)
  setAnswerSamples(
    @Args() args: SetAnswerSamplesArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.setAnswerSamples(context.user, args),
      SamplesResponseWrap
    );
  }
}
