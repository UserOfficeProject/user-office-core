import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetails } from '../types/BasicUserDetails';

@ArgsType()
class ResetPasswordArgs {
  @Field()
  public token: string;

  @Field()
  public password: string;
}

@Resolver()
export class ResetPasswordMutation {
  @Mutation(() => BasicUserDetails)
  resetPassword(
    @Args() args: ResetPasswordArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.resetPassword(context.user, args);
  }
}
