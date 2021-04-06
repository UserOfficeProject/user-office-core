import { Ctx, Mutation, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PrepareDBResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class PrepareDBMutationMutation {
  @Mutation(() => PrepareDBResponseWrap)
  prepareDB(
    @Ctx() context: ResolverContext,
    @Arg('includeSeeds', () => Boolean, { nullable: true })
    includeSeeds?: boolean | null
  ) {
    return wrapResponse(
      context.mutations.admin.resetDB(context.user, includeSeeds === true),
      PrepareDBResponseWrap
    );
  }
}
