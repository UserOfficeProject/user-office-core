import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class CheckExternalMutation {
  @Mutation(() => String)
  externalTokenLogin(
    @Arg('externalToken') externalToken: string,
    @Arg('redirectUri') redirectUri: string,
    @Arg('iss', { nullable: true }) iss: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.externalTokenLogin(
      externalToken,
      redirectUri,
      iss
    );
  }
}
