import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Question } from '../../types/Question';

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
  @Mutation(() => Question)
  updateQuestion(
    @Args() args: UpdateQuestionArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.updateQuestion(context.user, args);
  }
}
