import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Questionary } from '../types/Questionary';

@Resolver()
export class BlankQuestionaryQuery {
  @Query(() => Questionary)
  blankQuestionary(
    @Arg('templateId', () => Int) templateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.questionary.getBlankQuestionary(
      context.user,
      templateId
    );
  }
}
