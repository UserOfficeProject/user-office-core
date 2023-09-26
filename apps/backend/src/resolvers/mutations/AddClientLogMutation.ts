import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class AddClientLogMutation {
  @Mutation(() => Boolean)
  addClientLog(
    @Arg('error', () => String) error: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.addClientLog(error);
  }
}
