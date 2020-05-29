import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class AddClientLogMutation {
  @Mutation(() => SuccessResponseWrap)
  addClientLog(
    @Arg('error', () => String) error: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.addClientLog(error),
      SuccessResponseWrap
    );
  }
}
