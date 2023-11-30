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

  @Field(() => Int, { nullable: true })
  public rankOrder: number;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public submittedBy?: number | null;
}
