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
export class UpdateSampleEsiArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => Int)
  sampleId: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateSampleEsiMutation {
  @Mutation(() => SampleEsiResponseWrap)
  updateSampleEsi(
    @Args() args: UpdateSampleEsiArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sampleEsi.updateSampleEsi(context.user, args),
      SampleEsiResponseWrap
    );
  }
}
