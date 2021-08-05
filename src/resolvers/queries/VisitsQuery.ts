import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@InputType()
export class VisitsFilter {
  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => Int, { nullable: true })
  public proposalPk?: number;

  @Field(() => Int, { nullable: true })
  public scheduledEventId?: number;
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
