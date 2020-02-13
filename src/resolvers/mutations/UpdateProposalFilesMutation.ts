import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { ResponseWrapBase } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";
import { Response } from "../Decorators";

@ArgsType()
export class UpdateProposalFilesArgs {
  @Field(() => Int)
  public proposalId: number;

  @Field()
  public questionId: string;

  @Field(() => [String])
  public files: string[];
}

@ObjectType()
class UpdateProposalFilesResponseWrap extends ResponseWrapBase<string[]> {
  @Response()
  @Field(() => [String])
  public files: string[];
}

@Resolver()
export class UpdateProposalFilesMutation {
  @Mutation(() => UpdateProposalFilesResponseWrap)
  updateProposalFiles(
    @Args() args: UpdateProposalFilesArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.updateFiles(context.user, args),
      UpdateProposalFilesResponseWrap
    );
  }
}
