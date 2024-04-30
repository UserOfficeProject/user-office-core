import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class ResetPasswordEmailMutation {
  @Mutation(() => Boolean)
  async resetPasswordEmail(
    @Arg('email') email: string,
    @Ctx() context: ResolverContext
  ) {
    await context.mutations.user.resetPasswordEmail(context.user, {
      email,
    });

    return true;
  }
}
