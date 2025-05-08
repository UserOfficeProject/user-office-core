import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role';

@Resolver()
export class DeleteRoleMutation {
  @Mutation(() => Role)
  deleteRole(
    @Arg('roleId', () => Int) roleId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.deleteRole(context.user, roleId);
  }
}
