import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { SuccessResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class PrepareDBMutationMutation {
  @Mutation(() => SuccessResponseWrap)
  prepareDB(
    @Arg("key", () => String) key: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.resetDB(key),
      SuccessResponseWrap
    );
  }
}
