import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
import { DataType, ProposalStatus } from "../../models/ProposalModel";
import { Response } from "../Decorators";
import { ResponseWrapBase, ProposalResponseWrap } from "../Wrappers";
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

  @Field(() => ProposalStatus, { nullable: true })
  public status?: ProposalStatus;

  @Field(() => [Int], { nullable: true })
  public users?: number[];

  @Field(() => Int, { nullable: true })
  public proposerId?: number;

  @Field(() => Boolean, { nullable: true })
  public partialSave?: boolean;
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
      status,
      users,
      proposerId,
      partialSave
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
        status,
        users,
        proposerId,
        partialSave
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
