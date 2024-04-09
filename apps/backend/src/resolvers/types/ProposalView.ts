import {
  Field,
  Float,
  Int,
  ObjectType,
  Ctx,
  FieldResolver,
  Resolver,
  Root,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { AllocationTimeUnits } from '../../models/Call';
import {
  Proposal as ProposalOrigin,
  ProposalEndStatus,
} from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { User } from './User';

@InputType('FapInstrumentInput')
@ObjectType()
export class FapInstrument {
  @Field(() => Int, { nullable: true })
  fapId: number | null;

  @Field(() => Int)
  instrumentId: number;
}

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

  @Field(() => [Int], { nullable: 'itemsAndList' })
  public managementTimeAllocations?: number[];

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

  @Field(() => [FapInstrument], { nullable: true })
  public fapInstruments: FapInstrument[] | null;

  @Field(() => String, { nullable: true })
  public callShortCode: string;

  @Field(() => [String], { nullable: true })
  public fapCodes: string[];

  @Field(() => [Int], { nullable: true })
  public fapIds: number[];

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

@Resolver(() => ProposalView)
export class ProposalResolver {
  @FieldResolver(() => User, { nullable: true })
  async principalInvestigator(
    @Root() proposal: ProposalView,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    const user = await context.loaders.user.batchLoader.load(
      proposal.principalInvestigatorId
    );

    return user ? user : null;
  }
}
