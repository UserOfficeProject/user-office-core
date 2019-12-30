import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Args,
  ArgsType,
  Int,
  InputType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalStatus, DataType } from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ArgsType()
class UpdateProposalArgs {
  @Field(type => Int)
  public id: number;

  @Field(type => String, { nullable: true })
  public title?: string;

  @Field(type => String, { nullable: true })
  public abstract?: string;

  @Field(type => [ProposalAnswerInput], { nullable: true })
  public answers?: ProposalAnswerInput[];

  @Field(type => [Int], { nullable: true })
  public topicsCompleted?: number[];

  @Field(type => ProposalStatus, { nullable: true })
  public status?: ProposalStatus;

  @Field(type => [Int], { nullable: true })
  public users?: number[];

  @Field(type => Int, { nullable: true })
  public proposerId?: number;

  @Field(type => Boolean, { nullable: true })
  public partialSave?: boolean;
}

@ObjectType()
class UpdateProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field({ nullable: true })
  public proposal: Proposal;
  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

const wrap = wrapResponse<Proposal>(new UpdateProposalResponseWrap());

@Resolver()
export class UpdateProposalMutation {
  @Mutation(() => UpdateProposalResponseWrap, { nullable: true })
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
    return wrap(
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
      )
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
