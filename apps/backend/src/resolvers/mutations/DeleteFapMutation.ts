import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Fap } from '../types/Fap';

@Resolver()
export class DeleteFapMutation {
  @Mutation(() => Fap)
  deleteFap(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return context.mutations.fap.delete(context.user, { fapId: id });
  }
}
