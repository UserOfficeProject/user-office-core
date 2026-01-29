import { Arg, Ctx, Int, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { AccessRule } from '../types/AccessRule';

export class AcceptInvite {
  @Mutation(() => AccessRule)
  deleteAccessRuleMutation(@Arg('id', () => Int) id: number,
      @Ctx() context: ResolverContext) {
    return context.mutations.access.delete(context.user, id);
  }
}