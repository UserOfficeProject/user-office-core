import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { QuestionaryStep } from '../types/QuestionaryStep';

@Resolver()
export class BlankQuestionaryStepsByCallIdQuery {
  @Query(() => [QuestionaryStep], { nullable: true })
  blankQuestionaryStepsByCallId(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return context.queries.questionary.getBlankQuestionaryStepsByCallId(
      context.user,
      callId
    );
  }
}
