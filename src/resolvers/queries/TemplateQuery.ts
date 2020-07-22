import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Template } from '../types/Template';

@Resolver()
export class TemplateQuery {
  @Query(() => Template, { nullable: true })
  template(
    @Ctx() context: ResolverContext,
    @Arg('templateId', () => Int) templateId: number
  ) {
    return context.queries.template.getTemplate(context.user, templateId);
  }
}
