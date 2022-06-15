import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateGroupId } from '../../models/Template';

@Resolver()
export class ActiveTemplateId {
  @Query(() => Int, { nullable: true })
  activeTemplateId(
    @Arg('templateGroupId', () => TemplateGroupId)
    templateGroupId: TemplateGroupId,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getActiveTemplateId(
      context.user,
      templateGroupId
    );
  }
}
