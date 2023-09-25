import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Question } from '../types/Question';

@Resolver()
export class QuestionByNaturalKeyQuery {
  @Query(() => Question)
  questionByNaturalKey(
    @Arg('naturalKey', () => String)
    naturalKey: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getQuestionByNaturalKey(
      context.user,
      naturalKey
    );
  }
}
