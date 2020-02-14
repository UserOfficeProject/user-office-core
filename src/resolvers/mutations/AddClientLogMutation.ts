import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { wrapResponse } from "../wrapResponse";
import { SuccessResponseWrap } from "../types/CommonWrappers";

@Resolver()
export class AddClientLogMutation {
  @Mutation(() => SuccessResponseWrap)
  addClientLog(
    @Arg("error", () => String) error: string,
    @Ctx() context: ResolverContext
  ) {
    wrapResponse(
      context.mutations.admin.addClientLog(error),
      SuccessResponseWrap
    );
  }
}
