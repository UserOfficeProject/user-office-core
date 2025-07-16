import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Tag } from '../types/Tag';

@Resolver()
export class TagQuery {
  @Query(() => [Tag])
  async tags(@Ctx() context: ResolverContext): Promise<Tag[]> {
    return await context.queries.tag.getTags(null);
  }

  @Query(() => Tag, { nullable: true })
  async tag(
    @Arg('id') id: number,
    @Ctx() context: ResolverContext
  ): Promise<Tag | undefined> {
    return (await context.queries.tag.getTags([id])).pop();
  }
}
