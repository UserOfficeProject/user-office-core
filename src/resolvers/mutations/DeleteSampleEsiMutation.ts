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
export class DeleteSampleEsiInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  esiId: number;
}

@Resolver()
export class DeleteSampleEsiMutation {
  @Mutation(() => SampleEsiResponseWrap)
  deleteSampleEsi(
    @Args() input: DeleteSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sampleEsi.deleteSampleEsi(context.user, input),
      SampleEsiResponseWrap
    );
  }
}
