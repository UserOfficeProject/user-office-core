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
export class CreateSampleInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => String)
  questionId: string;

  @Field(() => Boolean, { nullable: true })
  isPostProposalSubmission?: boolean;
}

@Resolver()
export class CreateSampleMutation {
  @Mutation(() => Sample)
  createSample(
    @Args() input: CreateSampleInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sample.createSample(context.user, input);
  }
}
