import { ObjectType, Field, Int } from 'type-graphql';

import { FapMeetingDecision as FapMeetingDecisionOrigin } from '../../models/FapMeetingDecision';
import { ProposalEndStatus } from '../../models/Proposal';

@ObjectType()
export class FapMeetingDecision implements Partial<FapMeetingDecisionOrigin> {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => ProposalEndStatus, { nullable: true })
  public recommendation: ProposalEndStatus;

  @Field(() => String, { nullable: true })
  public commentForManagement: string;

  @Field(() => String, { nullable: true })
  public commentForUser: string;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public submittedBy?: number | null;

  @Field(() => Int)
  public recommendedInstrumentId: number;

  @Field(() => Int)
  public fapId: number;

  @Field(() => Int, { nullable: true })
  public recommendedTimeAllocation?: number | null;

  // @Field(() => String)
  // public meetingStatus: string;

  // @Field(() => String, { nullable: true })
  // public meetingNotes?: string | null;

  @Field(() => String, { nullable: true })
  public meetingScore?: string | null;
}
