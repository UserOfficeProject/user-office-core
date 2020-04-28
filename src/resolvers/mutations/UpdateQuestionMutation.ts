import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { QuestionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateQuestionArgs {
  @Field()
  public id: string;

  @Field({ nullable: true })
  public naturalKey?: string;

  @Field({ nullable: true })
  public question?: string;

  @Field({ nullable: true })
  public config?: string;
}

@Resolver()
export class UpdateQuestionMutation {
  @Mutation(() => QuestionResponseWrap)
  updateQuestion(
    @Args() args: UpdateQuestionArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateQuestion(context.user, args),
      QuestionResponseWrap
    );
  }
}
