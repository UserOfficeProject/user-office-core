import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalEndStatus } from '../../models/Proposal';
import { SepMeetingDecision as SepMeetingDecisionOrigin } from '../../models/SepMeetingDecision';

@ObjectType()
export class SepMeetingDecision implements Partial<SepMeetingDecisionOrigin> {
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
