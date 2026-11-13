import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PageName } from '../../models/Page';
import { Page } from '../types/Admin';

@Resolver()
export class PageContentQuery {
  @Query(() => [Page])
  pageContent(
    @Ctx() context: ResolverContext,
    @Arg('pageId', () => PageName) pageId: PageName,
    @Arg('roleIds', () => [Int]) roleIds: number[]
  ) {
    return context.queries.admin.getPageText({
      pageId,
      agent: context.user,
      roleIds,
    });
  }
}
