import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@InputType()
export class VisitsFilter {
  @Field(() => Int, { nullable: true })
  public visitorId?: number;

  @Field(() => Int, { nullable: true })
  public questionaryId?: number;
}

@Resolver()
export class VisitsQuery {
  @Query(() => [Visit])
  visits(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => VisitsFilter, { nullable: true })
    filter?: VisitsFilter
  ) {
    return context.queries.visit.getVisits(context.user, filter);
  }

  @Query(() => [Visit])
  myVisits(@Ctx() context: ResolverContext) {
    return context.queries.visit.getMyVisits(context.user);
  }
}
