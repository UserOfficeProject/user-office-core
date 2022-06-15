import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExternalTokenLoginWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CheckExternalMutation {
  @Mutation(() => ExternalTokenLoginWrap)
  externalTokenLogin(
    @Arg('externalToken') externalToken: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.externalTokenLogin(externalToken),
      ExternalTokenLoginWrap
    );
  }
}
