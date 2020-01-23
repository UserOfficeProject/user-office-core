import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { DataType } from "../../models/ProposalModel";
import { ProposalResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
class UpdateProposalArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => String, { nullable: true })
  public abstract?: string;

  @Field(() => [ProposalAnswerInput], { nullable: true })
  public answers?: ProposalAnswerInput[];

  @Field(() => [Int], { nullable: true })
  public topicsCompleted?: number[];

  @Field(() => [Int], { nullable: true })
  public users?: number[];

  @Field(() => Int, { nullable: true })
  public proposerId?: number;

  @Field(() => Boolean, { nullable: true })
  public partialSave?: boolean;

  @Field(() => Int, { nullable: true })
  public excellenceScore?: number;

  @Field(() => Int, { nullable: true })
  public technicalScore?: number;

  @Field(() => Int, { nullable: true })
  public safetyScore?: number;
}

@Resolver()
export class UpdateProposalMutation {
  @Mutation(() => ProposalResponseWrap, { nullable: true })
  updateProposal(
    @Args()
    {
      id,
      title,
      abstract,
      answers,
      topicsCompleted,
      users,
      proposerId,
      partialSave,
      excellenceScore,
      technicalScore,
      safetyScore
    }: UpdateProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.update(
        context.user,
        id,
        title,
        abstract,
        answers,
        topicsCompleted,
        users,
        proposerId,
        partialSave,
        excellenceScore,
        technicalScore,
        safetyScore
      ),
      ProposalResponseWrap
    );
  }
}

@InputType()
class ProposalAnswerInput {
  @Field()
  proposal_question_id: string;

  @Field(() => DataType, { nullable: true })
  data_type: DataType;

  @Field(() => String, { nullable: true })
  value: string;
}
