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
export class CreateSampleEsiInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  esiId: number;
}

@Resolver()
export class CreateSampleEsiMutation {
  @Mutation(() => SampleEsiResponseWrap)
  createSampleEsi(
    @Args() input: CreateSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sampleEsi.createSampleEsi(context.user, input),
      SampleEsiResponseWrap
    );
  }
}
