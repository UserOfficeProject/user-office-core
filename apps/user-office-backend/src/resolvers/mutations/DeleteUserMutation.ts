import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';
// import { UserResponseWrap } from '../types/CommonWrappers';

@Resolver()
export class DeleteUserMutation {
  @Mutation(() => User)
  deleteUser(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.delete(context.user, { id });
  }
}
