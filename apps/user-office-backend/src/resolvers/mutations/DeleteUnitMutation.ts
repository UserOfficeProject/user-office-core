import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Unit } from '../types/Unit';

@Resolver()
export class DeleteUnitMutation {
  @Mutation(() => Unit)
  deleteUnit(
    @Arg('id', () => String) id: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.unit.deleteUnit(context.user, id);
  }
}
