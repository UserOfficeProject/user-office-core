import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PrepareDBResponseWrap } from '../types/CommonWrappers';

@Resolver()
export class ApplyPatchesMutation {
  @Mutation(() => PrepareDBResponseWrap)
  applyPatches(@Ctx() context: ResolverContext) {
    return context.mutations.admin.applyPatches(context.user);
  }
}
