import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Questionary } from '../types/Questionary';

@Resolver()
export class QuestionaryQuery {
  @Query(() => Questionary, { nullable: true })
  questionary(
    @Arg('questionaryId', () => Int) questionaryId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.questionary.getQuestionary(
      context.user,
      questionaryId
    );
  }
}
