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

@Resolver()
export class GetPolicyConditionQuery {
  @Query(() => String, { nullable: true })
  async getPolicyCondition(
    @Arg('subject', () => String) subject: string,
    @Arg('resourceType', () => ResourceType) resourceType: ResourceType,
    @Arg('action', () => String) action: string,
    @Ctx() ctx: ResolverContext
  ): Promise<string | null> {
    return ctx.queries.permission.getPolicyCondition(
      ctx.user,
      subject,
      resourceType,
      action
    );
  }
}
