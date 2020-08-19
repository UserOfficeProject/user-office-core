import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PrepareDBResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class PrepareDBMutationMutation {
  @Mutation(() => PrepareDBResponseWrap)
  prepareDB(@Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.admin.resetDB(context.user),
      PrepareDBResponseWrap
    );
  }
}
