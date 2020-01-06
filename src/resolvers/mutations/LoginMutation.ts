import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Response } from "../Decorators";
import { ResponseWrapBase } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ObjectType()
class LoginResponseWrap extends ResponseWrapBase<string> {
  @Response()
  @Field(() => String, { nullable: true })
  public token: string;
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
  @Mutation(() => LoginResponseWrap)
  login(
    @Args() { email, password }: LoginArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.login(email, password),
      LoginResponseWrap
    );
  }
}
