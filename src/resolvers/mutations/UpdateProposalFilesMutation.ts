import {
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
  ArgsType,
  Args,
  ObjectType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

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
class UpdateProposalFilesResponseWrap extends AbstractResponseWrap<string[]> {
  @Field(() => [String])
  public files: string[];

  setValue(value: string[]): void {
    this.files = value;
  }
}

const wrap = wrapResponse<string[]>(new UpdateProposalFilesResponseWrap());

@Resolver()
export class UpdateProposalFilesMutation {
  @Mutation(() => UpdateProposalFilesResponseWrap, { nullable: true })
  updateProposalFiles(
    @Args() { proposal_id, question_id, files }: UpdateProposalFilesArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.proposal.updateFiles(
        context.user,
        proposal_id,
        question_id,
        files
      )
    );
  }
}
