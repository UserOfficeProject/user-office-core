import {
  Resolver,
  Ctx,
  Mutation,
  ObjectType,
  Field,
  Args,
  ArgsType,
  Int
} from "type-graphql";
import { ResolverContext } from "../../context";
import { createResponseWrapper, MutationResultBase } from "../Utils";
import { User } from "../../models/User";

const wrapUserMutation = createResponseWrapper<User>("user");

@ObjectType()
class UpdateUserMutationResult extends MutationResultBase {
  @Field(() => User, { nullable: true })
  public user: User;
}
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

  @Field(() => String, { nullable: true })
  public birthdate?: string;

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
}

@Resolver()
export class UpdateUserMutation {
  @Mutation(() => UpdateUserMutationResult, { nullable: true })
  updateUser(@Args() args: UpdateUserArgs, @Ctx() context: ResolverContext) {
    return wrapUserMutation(context.mutations.user.update(context.user, args));
  }
}
