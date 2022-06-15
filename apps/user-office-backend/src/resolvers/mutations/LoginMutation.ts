import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TokenResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
class LoginArgs {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class LoginMutation {
  @Mutation(() => TokenResponseWrap)
  login(@Args() args: LoginArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.login(context.user, args),
      TokenResponseWrap
    );
  }
}
