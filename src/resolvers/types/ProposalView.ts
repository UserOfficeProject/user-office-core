import { Field, Float, Int, ObjectType } from 'type-graphql';

import {
  Proposal as ProposalOrigin,
  ProposalEndStatus,
  ProposalStatusEnum,
} from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';

@ObjectType()
export class ProposalView implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => ProposalStatusEnum)
  public status: ProposalStatusEnum;

  @Field(() => String)
  public shortCode: string;

  @Field(() => Int, { nullable: true })
  public rankOrder: number;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus: ProposalEndStatus;

  @Field(() => Boolean)
  public notified: boolean;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public technicalStatus: TechnicalReviewStatus;

  @Field(() => String, { nullable: true })
  public instrumentName: string;

  @Field(() => String, { nullable: true })
  public callShortCode: string;

  @Field(() => String, { nullable: true })
  public sepShortCode: string;

  @Field(() => Float, { nullable: true })
  public reviewAverage: number;

  @Field(() => Float, { nullable: true })
  public reviewDeviation: number;

  @Field(() => Int, { nullable: true })
  public instrumentId: number;

  @Field(() => Int)
  public callId: number;
}
