import { Resolver, ObjectType, Arg, Ctx, Mutation, Field } from "type-graphql";
import { ResolverContext } from "../../context";
import { ResponseWrapBase } from "../Wrappers";
import { Response } from "../Decorators";
import { wrapResponse } from "../wrapResponse";

@ObjectType()
class TokenResponseWrap extends ResponseWrapBase<string> {
  @Response()
  @Field()
  public token: String;
}

@Resolver()
export class TokenMutation {
  @Mutation(() => TokenResponseWrap)
  token(@Arg("token") token: string, @Ctx() context: ResolverContext) {
    return wrapResponse(context.mutations.user.token(token), TokenResponseWrap);
  }
}
