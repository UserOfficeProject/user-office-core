import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalEndStatus } from '../../models/Proposal';
import { FapMeetingDecision } from '../types/FapMeetingDecision';
import { FapProposal } from '../types/FapProposal';

@InputType()
export class SaveFapMeetingDecisionInput {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public commentForUser?: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public recommendation?: ProposalEndStatus;

  @Field(() => Int, { nullable: true })
  public rankOrder?: number | null;

  @Field(() => Boolean, { nullable: true })
  public submitted?: boolean;

  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public fapId: number;
}

@InputType()
export class SubmitFapMeetingDecisionsInput {
  @Field(() => Int)
  public fapId: number;

  @Field(() => Int)
  public callId: number;
}

@Resolver()
export class FapMeetingDecisionMutation {
  @Mutation(() => FapMeetingDecision)
  saveFapMeetingDecision(
    @Arg('saveFapMeetingDecisionInput')
    saveFapMeetingDecisionInput: SaveFapMeetingDecisionInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.saveFapMeetingDecision(
      context.user,
      saveFapMeetingDecisionInput
    );
  }
}

@Resolver()
export class SubmitMeetingDecisionsMutation {
  @Mutation(() => [FapProposal])
  submitFapMeetingDecisions(
    @Arg('SubmitFapMeetingDecisionsInput')
    submitFapMeetingDecisionInput: SubmitFapMeetingDecisionsInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.submitFapMeetings(
      context.user,
      submitFapMeetingDecisionInput
    );
  }
}
