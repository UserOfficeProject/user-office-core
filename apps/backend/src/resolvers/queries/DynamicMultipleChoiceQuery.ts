import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class DynamicMultipleChoiceQuery {
  @Query(() => [String], { nullable: true })
  getDynamicMultipleChoiceOptions(
    @Arg('questionId', () => String) questionId: string,
    @Arg('templateId', () => Int, { nullable: true })
    templateId: number | null,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getDynamicMultipleChoiceOptions(
      context.user,
      questionId,
      templateId
    );
  }
}
