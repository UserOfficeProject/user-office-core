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

@ArgsType()
export class SelectRoleArgs {
  @Field(() => String)
  public token: string;

  @Field(() => Int, { nullable: true })
  public selectedRoleId: number;
}
@Resolver()
export class TokenMutation {
  @Mutation(() => String)
  token(@Arg('token') token: string, @Ctx() context: ResolverContext) {
    return context.mutations.user.token(token);
  }

  @Mutation(() => String)
  selectRole(@Args() args: SelectRoleArgs, @Ctx() context: ResolverContext) {
    return context.mutations.user.selectRole(args.token, args.selectedRoleId);
  }
}
