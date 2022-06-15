import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { wrapResponse } from '../wrapResponse';
import { QuestionResponseWrap } from './../types/CommonWrappers';

@Resolver()
export class DeleteQuestionMutation {
  @Mutation(() => QuestionResponseWrap)
  deleteQuestion(
    @Arg('questionId', () => String) questionId: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteQuestion(context.user, { questionId }),
      QuestionResponseWrap
    );
  }
}
