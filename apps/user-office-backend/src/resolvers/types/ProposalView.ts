import {
  Field,
  Float,
  Int,
  ObjectType,
  Ctx,
  FieldResolver,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { AllocationTimeUnits } from '../../models/Call';
import {
  Proposal as ProposalOrigin,
  ProposalEndStatus,
} from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { User } from './User';

@ObjectType()
export class ProposalView implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public primaryKey: number;

  @Field(() => String)
  public title: string;

  @Field(() => Int)
  public principalInvestigatorId: number;

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

  @Field(() => Int)
  public workflowId: number;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;
}

@Resolver(() => ProposalView)
export class ProposalResolver {
  @FieldResolver(() => User, { nullable: true })
  async principalInvestigator(
    @Root() proposal: ProposalView,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    return await context.queries.user.get(
      context.user,
      proposal.principalInvestigatorId
    );
  }
}
