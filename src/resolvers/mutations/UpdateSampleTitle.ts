import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  ArgsType,
  Int,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateSampleTitleArgs {
  @Field(() => Int)
  sampleId: number;

  @Field(() => String)
  title: string;
}

@Resolver()
export class UpdateSampleTitleMutation {
  @Mutation(() => SampleResponseWrap)
  updateSampleTitle(
    @Args() args: UpdateSampleTitleArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.updateSampleTitle(context.user, args),
      SampleResponseWrap
    );
  }
}
