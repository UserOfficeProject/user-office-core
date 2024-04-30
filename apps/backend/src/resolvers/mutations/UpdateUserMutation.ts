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
export class UpdateUserArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public user_title?: string;

  @Field(() => String, { nullable: true })
  public firstname?: string;

  @Field(() => String, { nullable: true })
  public middlename?: string;

  @Field(() => String, { nullable: true })
  public lastname?: string;

  @Field(() => String, { nullable: true })
  public username?: string;

  @Field(() => String, { nullable: true })
  public preferredname?: string;

  @Field(() => String, { nullable: true })
  public gender?: string;

  @Field(() => Int, { nullable: true })
  public nationality?: number;

  @Field({ nullable: true })
  public birthdate?: Date;

  @Field(() => Int, { nullable: true })
  public institutionId?: number;

  @Field(() => String, { nullable: true })
  public department?: string;

  @Field(() => String, { nullable: true })
  public position?: string;

  @Field(() => String, { nullable: true })
  public email?: string;

  @Field(() => String, { nullable: true })
  public telephone?: string;

  @Field(() => String, { nullable: true })
  public telephone_alt?: string;

  @Field(() => String, { nullable: true })
  public placeholder?: boolean;

  @Field(() => [Int], { nullable: true })
  public roles?: number[];

  public oauthAccessToken?: string | null;
  public oauthIssuer?: string | null;
  public oauthRefreshToken?: string | null;
  public oidcSub?: string | null;
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
  updateUser(@Args() args: UpdateUserArgs, @Ctx() context: ResolverContext) {
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
