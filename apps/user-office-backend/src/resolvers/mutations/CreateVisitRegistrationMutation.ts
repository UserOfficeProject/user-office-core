import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitRegistrationResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateVisitRegistrationMutation {
  @Mutation(() => VisitRegistrationResponseWrap)
  createVisitRegistration(
    @Arg('visitId', () => Int) visitId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visit.createVisitRegistration(context.user, visitId),
      VisitRegistrationResponseWrap
    );
  }
}
