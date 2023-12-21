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
  public managementTimeAllocation?: number;

  @Field(() => [Int], { nullable: 'itemsAndList' })
  public technicalTimeAllocations?: number[];

  @Field(() => [Int], { nullable: 'itemsAndList' })
  public technicalReviewAssigneeIds?: number[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  public technicalReviewAssigneeNames?: string[];

  @Field(() => [TechnicalReviewStatus], { nullable: 'itemsAndList' })
  public technicalStatuses?: TechnicalReviewStatus[];

  @Field(() => [Int], { nullable: 'itemsAndList' })
  public technicalReviewsSubmitted?: boolean[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  public instrumentNames?: string[];

  @Field(() => [Int], { nullable: 'itemsAndList' })
  public instrumentIds?: number[];

  @Field(() => String, { nullable: true })
  public callShortCode: string;

  @Field(() => String, { nullable: true })
  public fapCode: string;

  @Field(() => Int, { nullable: true })
  public fapId: number;

  @Field(() => Float, { nullable: true })
  public reviewAverage: number;

  @Field(() => Float, { nullable: true })
  public reviewDeviation: number;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;
}

// TODO: Investigate if this could be removed and instead we keep all the information in the view. Like we do with the technical assignee name.
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
