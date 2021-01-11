import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateCategoryId } from '../../models/Template';

@Resolver()
export class ActiveTemplateId {
  @Query(() => Int, { nullable: true })
  activeTemplateId(
    @Arg('templateCategoryId', () => TemplateCategoryId)
    templateCategoryId: TemplateCategoryId,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getActiveTemplateId(
      context.user,
      templateCategoryId
    );
  }
}
