import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { TokenResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class ObtainTokenForMutation {
  @Mutation(() => TokenResponseWrap)
  login(
    @Arg("userId", () => Int) userId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.obtainTokenForUser(context.user, userId),
      TokenResponseWrap
    );
  }
}
