import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Question } from '../../types/Question';

@Resolver()
export class DeleteQuestionMutation {
  @Mutation(() => Question)
  deleteQuestion(
    @Arg('questionId', () => String) questionId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.deleteQuestion(context.user, {
      questionId,
    });
  }
}
