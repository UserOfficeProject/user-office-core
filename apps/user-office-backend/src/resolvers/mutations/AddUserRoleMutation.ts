import {
  Resolver,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class AddUserRoleArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public roleID: number;
}

@Resolver()
export class AddUserRoleMutation {
  @Mutation(() => Boolean)
  addUserRole(@Args() args: AddUserRoleArgs, @Ctx() context: ResolverContext) {
    return context.mutations.user.addUserRole(context.user, args);
  }
}
