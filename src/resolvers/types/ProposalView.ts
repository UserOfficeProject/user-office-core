import { Field, Int, ObjectType } from 'type-graphql';

import { Proposal as ProposalOrigin } from '../../models/Proposal';
import { ProposalStatus } from '../../models/ProposalModel';
import { ProposalEndStatus } from '../../models/ProposalModel';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
@ObjectType()
export class ProposalView implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => ProposalStatus)
  public status: ProposalStatus;

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

  @Field(() => Int, { nullable: true })
  public reviewAverage: number;

  @Field(() => Int, { nullable: true })
  public reviewDeviation: number;

  @Field(() => Int, { nullable: true })
  public instrumentId: number;

  @Field(() => Int, { nullable: true })
  public callId: number;
}
