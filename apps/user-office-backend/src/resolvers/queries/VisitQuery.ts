import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@Resolver()
export class VisitQuery {
  @Query(() => Visit, { nullable: true })
  visit(
    @Ctx() context: ResolverContext,
    @Arg('visitId', () => Int) visitId: number
  ) {
    return context.queries.visit.getVisit(context.user, visitId);
  }
}
