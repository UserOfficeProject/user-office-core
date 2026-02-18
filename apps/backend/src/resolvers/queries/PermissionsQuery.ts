import { Arg, Ctx, Query, Resolver } from 'type-graphql';
import { ObjectType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
export class AuthResourceMetadata {
  @Field(() => [String])
  attributes: string[];

  @Field(() => [String])
  functions: string[];
}

@Resolver()
export class GetAuthResourceMetadataQuery {
  @Query(() => AuthResourceMetadata)
  async getAuthResourceMetadata(
    @Arg('resourceType', () => String) resourceType: string,
    @Ctx() ctx: ResolverContext
  ): Promise<AuthResourceMetadata> {
    return ctx.queries.permission.getAuthResourceMetadata(
      ctx.user,
      resourceType
    );
  }
}
