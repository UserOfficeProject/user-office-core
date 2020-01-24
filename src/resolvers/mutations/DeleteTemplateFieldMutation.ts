import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalTemplateResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class DeleteTemplateFieldMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteTemplateField(
    @Arg("id", () => String) id: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteTemplateField(context.user, id),
      ProposalTemplateResponseWrap
    );
  }
}
