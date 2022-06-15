import { Field, Float, Int, ObjectType } from 'type-graphql';

import { AllocationTimeUnits } from '../../models/Call';
import {
  Proposal as ProposalOrigin,
  ProposalEndStatus,
} from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';

@ObjectType()
export class ProposalView implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public primaryKey: number;

  @Field(() => String)
  public title: string;

  @Field(() => Int)
  public statusId: number;

  @Field(() => String)
  public statusName: string;

  @Field(() => String)
  public statusDescription: string;

  @Field(() => String)
  public proposalId: string;

  @Field(() => Int, { nullable: true })
  public rankOrder: number;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus: ProposalEndStatus;

  @Field(() => Boolean)
  public notified: boolean;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public technicalTimeAllocation: number;

  @Field(() => Int, { nullable: true })
  public managementTimeAllocation: number;

  @Field(() => Int, { nullable: true })
  public technicalReviewAssigneeId: number;

  @Field(() => String, { nullable: true })
  public technicalReviewAssigneeFirstName: string;

  @Field(() => String, { nullable: true })
  public technicalReviewAssigneeLastName: string;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public technicalStatus: TechnicalReviewStatus;

  @Field(() => Int, { nullable: true })
  public technicalReviewSubmitted: boolean;

  @Field(() => String, { nullable: true })
  public instrumentName: string;

  @Field(() => String, { nullable: true })
  public callShortCode: string;

  @Field(() => String, { nullable: true })
  public sepCode: string;

  @Field(() => Int, { nullable: true })
  public sepId: number;

  @Field(() => Float, { nullable: true })
  public reviewAverage: number;

  @Field(() => Float, { nullable: true })
  public reviewDeviation: number;

  @Field(() => Int, { nullable: true })
  public instrumentId: number;

  @Field(() => Int)
  public callId: number;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;
}
