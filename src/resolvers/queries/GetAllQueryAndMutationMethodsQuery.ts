import { Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
export class QueriesAndMutations {
  @Field(() => [String])
  public queries: string[];

  @Field(() => [String])
  public mutations: string[];
}

@Resolver()
export class GetAllQueryAndMutationMethodsQuery {
  @Query(() => QueriesAndMutations, { nullable: true })
  queriesAndMutations(@Ctx() context: ResolverContext) {
    return context.queries.admin.getAllQueryAndMutationMethods(
      context.user,
      context
    );
  }
}
