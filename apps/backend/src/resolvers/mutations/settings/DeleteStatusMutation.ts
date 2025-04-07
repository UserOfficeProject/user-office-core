import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Status } from '../../types/Status';

@Resolver()
export class DeleteStatusMutation {
  @Mutation(() => Status)
  async deleteStatus(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.status.deleteStatus(context.user, {
      id,
    });
  }
}
