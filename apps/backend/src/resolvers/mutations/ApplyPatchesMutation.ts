import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class ApplyPatchesMutation {
  @Mutation(() => [String])
  applyPatches(@Ctx() context: ResolverContext) {
    return context.mutations.admin.applyPatches(context.user);
  }
}
