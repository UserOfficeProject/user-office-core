import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalEndStatus } from '../../models/Proposal';
import { SepMeetingDecision as SepMeetingDecisionOrigin } from '../../models/SepMeetingDecision';

@ObjectType()
export class SepMeetingDecision implements Partial<SepMeetingDecisionOrigin> {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => ProposalEndStatus, { nullable: true })
  public recommendation: ProposalEndStatus;

  @Field(() => String)
  public commentForManagement: string;

  @Field(() => String)
  public commentForUser: string;

  @Field(() => Int)
  public rankOrder: number;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public submittedBy?: number | null;
}
