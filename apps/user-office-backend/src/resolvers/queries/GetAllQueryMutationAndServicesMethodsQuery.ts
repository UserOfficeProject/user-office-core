import { Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
export class QueriesMutationsAndServices {
  @Field(() => [String])
  public queries: string[];

  @Field(() => [String])
  public mutations: string[];

  @Field(() => [String])
  public services: string[];
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
