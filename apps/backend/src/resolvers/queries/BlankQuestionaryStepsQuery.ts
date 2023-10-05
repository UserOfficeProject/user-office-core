import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { QuestionaryStep } from '../types/QuestionaryStep';

@Resolver()
export class BlankQuestionaryStepsQuery {
  @Query(() => [QuestionaryStep], { nullable: true })
  blankQuestionarySteps(
    @Ctx() context: ResolverContext,
    @Arg('templateId', () => Int) templateId: number
  ) {
    return context.queries.questionary.getBlankQuestionarySteps(
      context.user,
      templateId
    );
  }
}
