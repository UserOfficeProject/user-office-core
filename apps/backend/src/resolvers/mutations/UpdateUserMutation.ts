import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';

@ArgsType()
class UpdateUserArgs {
  @Field(() => String, { nullable: true })
  public user_title?: string;

  @Field(() => String, { nullable: true })
  public firstname?: string;

  @Field(() => String, { nullable: true })
  public lastname?: string;

  @Field(() => String, { nullable: true })
  public preferredname?: string;

  @Field(() => Int, { nullable: true })
  public institutionId?: number;

  @Field(() => String, { nullable: true })
  public email?: string;

  @Field(() => [Int], { nullable: true })
  public roles?: number[];

  public oauthAccessToken?: string | null;
  public oauthIssuer?: string | null;
  public oauthRefreshToken?: string | null;
}

@ArgsType()
export class UpdateUserByIdArgs extends UpdateUserArgs {
  @Field(() => Int!)
  public id: number;

  public oidcSub?: string | null;
}

@ArgsType()
export class UpdateUserByOidcSubArgs extends UpdateUserArgs {
  @Field(() => String!)
  public oidcSub: string;

  public id: number;
}

@ArgsType()
export class UpdateUserRolesArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => [Int], { nullable: true })
  public roles: number[];
}

@Resolver()
export class UpdateUserMutation {
  @Mutation(() => User)
  updateUser(
    @Args() args: UpdateUserByIdArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.update(context.user, args);
  }

  @Mutation(() => User)
  updateUserRoles(
    @Args() args: UpdateUserRolesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.updateRoles(context.user, args);
  }

  @Mutation(() => User)
  setUserNotPlaceholder(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.setUserNotPlaceholder(context.user, id);
  }
}
