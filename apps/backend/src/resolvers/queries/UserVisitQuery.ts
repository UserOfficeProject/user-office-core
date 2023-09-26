import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitRegistration } from '../types/VisitRegistration';

@Resolver()
export class VisitRegistrationQuery {
  @Query(() => VisitRegistration, { nullable: true })
  visitRegistration(
    @Ctx() context: ResolverContext,
    @Arg('visitId', () => Int) visitId: number
  ) {
    return context.queries.visit.getRegistration(context.user, visitId);
  }
}
