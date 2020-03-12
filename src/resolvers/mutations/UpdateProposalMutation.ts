import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { DataType } from '../../models/ProposalModel';
import { ProposalEndStatus } from '../../models/ProposalModel';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateProposalArgs {
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
  public rankOrder?: number;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus?: ProposalEndStatus;
}

@Resolver()
export class UpdateProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  updateProposal(
    @Args()
    args: UpdateProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.update(context.user, args),
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
