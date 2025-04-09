import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitRegistration } from '../types/VisitRegistration';

@Resolver()
export class CreateVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  createVisitRegistration(
    @Arg('visitId', () => Int) visitId: number,
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.createVisitRegistration(
      context.user,
      visitId,
      userId
    );
  }
}
