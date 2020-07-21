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
export class CreateSampleArgs {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class CreateSampleMutation {
  @Mutation(() => SampleResponseWrap)
  createSample(
    @Args() args: CreateSampleArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.createSample(context.user, args),
      SampleResponseWrap
    );
  }
}
