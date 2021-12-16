import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetailsResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
class ResetPasswordArgs {
  @Field()
  public token: string;

  @Field()
  public password: string;
}

@Resolver()
export class ResetPasswordMutation {
  @Mutation(() => BasicUserDetailsResponseWrap)
  resetPassword(
    @Args() args: ResetPasswordArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.resetPassword(context.user, args),
      BasicUserDetailsResponseWrap
    );
  }
}
