import { Arg, Ctx, Query, Resolver } from 'type-graphql';
import { ObjectType, Field } from 'type-graphql';

import { ResourceType } from '../../auth/AuthRegistry';
import { ResolverContext } from '../../context';

@ObjectType()
export class AuthResourceMetadata {
  @Field(() => [String])
  userAttributes: string[];

  @Field(() => [String])
  resourceAttributes: string[];

  @Field(() => [String])
  resourceFunctions: string[];
}

@Resolver()
export class GetAuthResourceMetadataQuery {
  @Query(() => AuthResourceMetadata)
  async getAuthResourceMetadata(
    @Arg('resourceType', () => ResourceType) resourceType: ResourceType,
    @Ctx() ctx: ResolverContext
  ): Promise<AuthResourceMetadata> {
    return ctx.queries.permission.getAuthResourceMetadata(
      ctx.user,
      resourceType
    );
  }
}
