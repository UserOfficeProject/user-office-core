import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { TokenResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class TokenMutation {
  @Mutation(() => TokenResponseWrap)
  token(@Arg("token") token: string, @Ctx() context: ResolverContext) {
    return wrapResponse(context.mutations.user.token(token), TokenResponseWrap);
  }
}
