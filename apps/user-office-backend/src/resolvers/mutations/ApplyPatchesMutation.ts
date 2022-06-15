import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PrepareDBResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ApplyPatchesMutation {
  @Mutation(() => PrepareDBResponseWrap)
  applyPatches(@Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.admin.applyPatches(context.user),
      PrepareDBResponseWrap
    );
  }
}
