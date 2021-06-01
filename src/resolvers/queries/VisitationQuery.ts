import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visitation } from '../types/Visitation';

@Resolver()
export class VisitationQuery {
  @Query(() => Visitation, { nullable: true })
  visitation(
    @Ctx() context: ResolverContext,
    @Arg('visitationId', () => Int) visitationId: number
  ) {
    return context.queries.visitation.getVisitation(context.user, visitationId);
  }
}
