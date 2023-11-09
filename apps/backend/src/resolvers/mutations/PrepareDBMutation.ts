import { Ctx, Mutation, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class PrepareDBMutationMutation {
  @Mutation(() => [String])
  prepareDB(
    @Ctx() context: ResolverContext,
    @Arg('includeSeeds', () => Boolean, { nullable: true })
    includeSeeds?: boolean | null
  ) {
    return context.mutations.admin.resetDB(context.user, includeSeeds === true);
  }
}
