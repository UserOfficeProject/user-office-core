import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitRegistrationResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateVisitRegistrationQuestionaryMutation {
  @Mutation(() => VisitRegistrationResponseWrap)
  createVisitRegistrationQuestionary(
    @Arg('visitId', () => Int) visitId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visit.createVisitRegistrationQuestionary(
        context.user,
        visitId
      ),
      VisitRegistrationResponseWrap
    );
  }
}
