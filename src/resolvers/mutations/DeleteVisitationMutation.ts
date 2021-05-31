import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitationResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteVisitation {
  @Mutation(() => VisitationResponseWrap)
  deleteVisitation(
    @Arg('visitationId', () => Int) visitationId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visitation.deleteVisitation(context.user, visitationId),
      VisitationResponseWrap
    );
  }
}
