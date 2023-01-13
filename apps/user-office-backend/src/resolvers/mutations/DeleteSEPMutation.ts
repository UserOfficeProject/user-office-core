import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';

@Resolver()
export class DeleteSEPMutation {
  @Mutation(() => SEP)
  deleteSEP(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return context.mutations.sep.delete(context.user, { sepId: id });
  }
}
