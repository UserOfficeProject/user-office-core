import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SamplesResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AddSamplesToAnswerArgs {
  @Field(() => Int!)
  answerId: number;

  @Field(() => [Int!]!)
  sampleIds: number[];
}

@Resolver()
export class AddSamplesToAnswer {
  @Mutation(() => SamplesResponseWrap)
  addSamplesToAnswer(
    @Args() args: AddSamplesToAnswerArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.addSamplesToAnswer(context.user, args),
      SamplesResponseWrap
    );
  }
}
