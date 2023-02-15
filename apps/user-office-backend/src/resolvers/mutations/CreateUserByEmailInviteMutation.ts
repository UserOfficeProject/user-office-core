import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserRole } from '../../models/User';

@ArgsType()
export class CreateUserByEmailInviteArgs {
  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public email: string;

  @Field(() => UserRole)
  userRole: UserRole;
}

@Resolver()
export class CreateUserByEmailInviteMutation {
  @Mutation(() => Int)
  async createUserByEmailInvite(
    @Args() args: CreateUserByEmailInviteArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.user.createUserByEmailInvite(
      context.user,
      args
    );

    return res.userId;
  }
}
