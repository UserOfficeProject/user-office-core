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
import { SampleEsiResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CloneSampleEsiInput {
  @Field(() => Int)
  esiId: number;

  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  newSampleTitle?: string;
}

@Resolver()
export class CloneSampleEsiMutation {
  @Mutation(() => SampleEsiResponseWrap)
  cloneSampleEsi(
    @Args() args: CloneSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sampleEsi.cloneSampleEsi(context.user, args),
      SampleEsiResponseWrap
    );
  }
}
