import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PageName } from '../../models/Page';
import { Page } from '../types/Admin';

@Resolver()
export class SetPageContentMutation {
  @Mutation(() => Page)
  setPageContent(
    @Arg('id', () => PageName) id: PageName,
    @Arg('text', () => String) text: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.setPageText(context.user, { id, text });
  }
}
