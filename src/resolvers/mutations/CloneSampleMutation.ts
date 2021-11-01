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
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CloneSampleInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => Boolean, { nullable: true })
  isPostProposalSubmission?: boolean;
}

@Resolver()
export class CloneSampleMutation {
  @Mutation(() => SampleResponseWrap)
  cloneSample(@Args() args: CloneSampleInput, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.sample.cloneSample(context.user, args),
      SampleResponseWrap
    );
  }
}
