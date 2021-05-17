import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ResetPasswordEmailMutation {
  @Mutation(() => SuccessResponseWrap)
  async resetPasswordEmail(
    @Arg('email') email: string,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.user.resetPasswordEmail(context.user, {
      email,
    });

    return wrapResponse(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(true),
      SuccessResponseWrap
    );
  }
}
