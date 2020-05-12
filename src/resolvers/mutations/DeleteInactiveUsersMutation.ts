import { Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { RemoveInactiveUsersWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteInactiveUsersMutation {
  @Mutation(() => RemoveInactiveUsersWrap)
  deleteInactiveUsers(@Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.deleteInactiveUsers(context.user),
      RemoveInactiveUsersWrap
    );
  }
}
