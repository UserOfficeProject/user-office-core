import { Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

export enum QueryMutationAndServicesGroups {
  CORE = 'core',
  SCHEDULER = 'scheduler',
}

@ObjectType()
export class QueryMutationAndServicesGroup {
  @Field(() => QueryMutationAndServicesGroups)
  public groupName: QueryMutationAndServicesGroups;

  @Field(() => [String])
  public items: string[];
}
@ObjectType()
export class QueriesMutationsAndServices {
  @Field(() => [QueryMutationAndServicesGroup])
  public queries: QueryMutationAndServicesGroup[];

  @Field(() => [QueryMutationAndServicesGroup])
  public mutations: QueryMutationAndServicesGroup[];

  @Field(() => [QueryMutationAndServicesGroup])
  public services: QueryMutationAndServicesGroup[];
}

@Resolver()
export class GetAllQueryMutationAndServicesMethodsQuery {
  @Query(() => QueriesMutationsAndServices, { nullable: true })
  queriesMutationsAndServices(@Ctx() context: ResolverContext) {
    return context.queries.admin.getAllQueryMutationAndServicesMethods(
      context.user,
      context
    );
  }
}
