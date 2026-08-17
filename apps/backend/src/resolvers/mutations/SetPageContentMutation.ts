import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PageName } from '../../models/Page';
import { Page } from '../types/Admin';

@Resolver()
export class SetPageContentMutation {
  @Mutation(() => Page)
  setPageContent(
    @Ctx() context: ResolverContext,
    @Arg('pageId', () => PageName) pageId: PageName,
    @Arg('text', () => String) text: string,
    @Arg('roleId', () => Int, { nullable: true }) roleId: number,
  ) {
    return context.mutations.admin.setPageText(context.user, { pageId, text, roleId });
  }
}
