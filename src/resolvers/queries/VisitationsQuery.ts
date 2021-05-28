import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visitation } from '../types/Visitation';

@InputType()
export class VisitationsFilter {
  @Field(() => Int, { nullable: true })
  public visitorId?: number;

  @Field(() => Int, { nullable: true })
  public questionaryId?: number;
}

@Resolver()
export class VisitationsQuery {
  @Query(() => [Visitation])
  visitations(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => VisitationsFilter, { nullable: true })
    filter?: VisitationsFilter
  ) {
    return context.queries.visitation.getVisitations(context.user, filter);
  }

  @Query(() => [Visitation])
  myVisitations(@Ctx() context: ResolverContext) {
    return context.queries.visitation.getMyVisitations(context.user);
  }
}
