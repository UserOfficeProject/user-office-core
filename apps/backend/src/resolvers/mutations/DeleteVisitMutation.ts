import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@Resolver()
export class DeleteVisit {
  @Mutation(() => Visit)
  deleteVisit(
    @Arg('visitId', () => Int) visitId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.deleteVisit(context.user, visitId);
  }
}
