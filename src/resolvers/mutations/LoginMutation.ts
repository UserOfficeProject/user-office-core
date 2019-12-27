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
import { wrapResponse, AbstractResponseWrap } from "../Utils";

@ObjectType()
class LoginResponseWrap extends AbstractResponseWrap<string> {
  @Field(() => String, { nullable: true })
  public token: string;

  setValue(value: string): void {
    this.token = value;
  }
}

const wrap = wrapResponse<String>(new LoginResponseWrap());

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
    return wrap(context.mutations.user.login(email, password));
  }
}
