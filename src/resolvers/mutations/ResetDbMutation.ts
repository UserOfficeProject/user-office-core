import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { SuccessResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class ResetDbMutationMutation {
  @Mutation(() => SuccessResponseWrap)
  resetDB(
    @Arg("password", () => String) password: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.resetDb(password),
      SuccessResponseWrap
    );
  }
}
