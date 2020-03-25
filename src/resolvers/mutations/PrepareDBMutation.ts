import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class PrepareDBMutationMutation1 {
  @Mutation(() => SuccessResponseWrap)
  prepareDB(@Ctx() context: ResolverContext) {
    return wrapResponse(context.mutations.admin.resetDB(), SuccessResponseWrap);
  }
}
