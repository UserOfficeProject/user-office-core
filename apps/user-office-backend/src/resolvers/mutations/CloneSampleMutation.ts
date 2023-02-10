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
import { Sample } from '../types/Sample';

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
  @Mutation(() => Sample)
  cloneSample(@Args() args: CloneSampleInput, @Ctx() context: ResolverContext) {
    return context.mutations.sample.cloneSample(context.user, args);
  }
}
