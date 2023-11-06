import { Query, Ctx, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class DynamicMultipleChoiceQuery {
  @Query(() => [String], { nullable: true })
  getDynamicMultipleChoiceOptions(
    @Arg('questionId', () => String) questionId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getDynamicMultipleChoiceOptions(
      context.user,
      questionId
    );
  }
}
