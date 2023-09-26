import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class EmailVerificationMutation {
  @Mutation(() => Boolean)
  emailVerification(
    @Arg('token') token: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.emailVerification(token);
  }
}
