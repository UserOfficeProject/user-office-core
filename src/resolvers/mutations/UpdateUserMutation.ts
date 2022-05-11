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
import { UserResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  public organisation?: number;

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

  @Field(() => String, { nullable: true })
  public orcid?: string;

  @Field(() => String, { nullable: true })
  public refreshToken?: string;

  @Field(() => String, { nullable: true })
  public otherOrganisation?: string;

  @Field(() => Int, { nullable: true })
  public organizationCountry?: number;
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
  @Mutation(() => UserResponseWrap)
  updateUser(@Args() args: UpdateUserArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.update(context.user, args),
      UserResponseWrap
    );
  }

  @Mutation(() => UserResponseWrap)
  updateUserRoles(
    @Args() args: UpdateUserRolesArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.updateRoles(context.user, args),
      UserResponseWrap
    );
  }

  @Mutation(() => UserResponseWrap)
  setUserEmailVerified(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.setUserEmailVerified(context.user, id),
      UserResponseWrap
    );
  }

  @Mutation(() => UserResponseWrap)
  setUserNotPlaceholder(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.setUserNotPlaceholder(context.user, id),
      UserResponseWrap
    );
  }
}
