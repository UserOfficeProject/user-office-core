import { Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

export enum QueryAndMutationGroups {
  CORE = 'core',
  SCHEDULER = 'scheduler',
}

@ObjectType()
export class QueryAndMutationGroup {
  @Field(() => QueryAndMutationGroups)
  public groupName: QueryAndMutationGroups;

  @Field(() => [String])
  public items: string[];
}
@ObjectType()
export class QueriesAndMutations {
  @Field(() => [QueryAndMutationGroup])
  public queries: QueryAndMutationGroup[];

  @Field(() => [QueryAndMutationGroup])
  public mutations: QueryAndMutationGroup[];
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
