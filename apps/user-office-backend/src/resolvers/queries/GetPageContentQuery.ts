import { Query, Arg, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PageName } from '../../models/Page';
@Resolver()
export class GetPageContentQuery {
  @Query(() => String, { nullable: true })
  getPageContent(
    @Arg('pageId', () => PageName) pageId: PageName,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.admin.getPageText(pageId);
  }
}
