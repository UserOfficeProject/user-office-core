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
class UpdateProposalFilesArgs {
  @Field(() => Int)
  public proposal_id: number;

  @Field()
  public question_id: string;

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
  @Mutation(() => UpdateProposalFilesResponseWrap, { nullable: true })
  updateProposalFiles(
    @Args() { proposal_id, question_id, files }: UpdateProposalFilesArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.updateFiles(
        context.user,
        proposal_id,
        question_id,
        files
      ),
      UpdateProposalFilesResponseWrap
    );
  }
}
