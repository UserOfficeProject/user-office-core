import {
  Arg,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Tag } from '../types/Tag';

@ObjectType()
class RoleTagsResult {
  @Field(() => Int)
  roleId: number;

  @Field(() => [Tag])
  tags: Tag[];
}

@Resolver()
export class RoleTagsQuery {
  @Query(() => RoleTagsResult, { nullable: true })
  async roleTagsByRoleId(
    @Arg('roleId', () => Int) roleId: number,
    @Ctx() context: ResolverContext
  ): Promise<RoleTagsResult | null> {
    const tags = await context.queries.roleTags.getTagsByRoleId(
      context.user,
      roleId
    );

    return {
      roleId,
      tags,
    };
  }
}
