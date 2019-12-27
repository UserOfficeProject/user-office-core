import {
  Mutation,
  Resolver,
  ObjectType,
  Field,
  ArgsType,
  Args,
  Ctx
} from "type-graphql";

import { ResolverContext } from "../../context";
import { createResponseWrapper, MutationResultBase } from "../Utils";
import { User } from "../../models/User";

const wrapLoginMutation = createResponseWrapper<String>("token");

@ObjectType()
class LoginMutationResult extends MutationResultBase {
  @Field(() => String, { nullable: true })
  public token: String;
}

@ArgsType()
class LoginArgs {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class LoginMutation {
  @Mutation(() => LoginMutationResult, { nullable: true })
  login(
    @Args() { email, password }: LoginArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapLoginMutation(context.mutations.user.login(email, password));
  }
}
