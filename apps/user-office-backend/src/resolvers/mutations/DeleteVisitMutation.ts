import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteVisit {
  @Mutation(() => VisitResponseWrap)
  deleteVisit(
    @Arg('visitId', () => Int) visitId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visit.deleteVisit(context.user, visitId),
      VisitResponseWrap
    );
  }
}
