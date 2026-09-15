import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PageName } from '../../models/Page';

@Resolver()
export class PageContentQuery {
  @Query(() => String, { nullable: true })
  pageContent(
    @Ctx() context: ResolverContext,
    @Arg('pageId', () => PageName) pageId: PageName,
    @Arg('roleId', () => Int, { nullable: true }) roleId?: number
  ) {
    return context.queries.admin.getPageText({
      pageId,
      roleId,
    });
  }
}
