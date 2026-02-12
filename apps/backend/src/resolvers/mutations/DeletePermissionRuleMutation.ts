import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionRule } from '../types/PermissionRule';

@Resolver()
export class DeletePermissionRuleMutation {
  @Mutation(() => PermissionRule)
  deletePermissionRule(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.permission.delete(context.user, id);
  }
}