import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
  Field,
  ArgsType,
  Args,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TokenResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class SelectRoleArgs {
  @Field(() => String)
  public token: string;

  @Field(() => Int, { nullable: true })
  public selectedRoleId: number;
}
@Resolver()
export class TokenMutation {
  @Mutation(() => TokenResponseWrap)
  token(@Arg('token') token: string, @Ctx() context: ResolverContext) {
    return wrapResponse(context.mutations.user.token(token), TokenResponseWrap);
  }

  @Mutation(() => TokenResponseWrap)
  selectRole(@Args() args: SelectRoleArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.selectRole(args.token, args.selectedRoleId),
      TokenResponseWrap
    );
  }
}
