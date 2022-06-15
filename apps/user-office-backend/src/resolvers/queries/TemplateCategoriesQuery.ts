import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateCategory } from '../types/TemplateCategory';

@Resolver()
export class TemplateCategoriesQuery {
  @Query(() => [TemplateCategory], { nullable: true })
  templateCategories(@Ctx() context: ResolverContext) {
    return context.queries.template.getTemplateCategories(context.user);
  }
}
