import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteSEPMutation {
  @Mutation(() => SEPResponseWrap)
  deleteSEP(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.sep.delete(context.user, { sepId: id }),
      SEPResponseWrap
    );
  }
}
