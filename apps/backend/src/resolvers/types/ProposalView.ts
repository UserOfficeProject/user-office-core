import {
  Field,
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

  @Field(() => Int, { nullable: true })
  instrumentId: number;
}

@ObjectType()
export class ProposalViewInstrument {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  managerUserId: number;

  @Field(() => Int, { nullable: true })
  managementTimeAllocation: number;
}

@ObjectType()
export class ProposalViewTechnique {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class ProposalViewFap {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  code: string;
}

@ObjectType()
export class ProposalViewTechnicalReviewAssignee {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;
}

@ObjectType()
export class ProposalViewTechnicalReview {
  @Field(() => Int)
  id: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  status: TechnicalReviewStatus;

  @Field(() => Boolean)
  submitted: boolean;

  @Field(() => Int, { nullable: true })
  timeAllocation: number;

  @Field(() => ProposalViewTechnicalReviewAssignee, { nullable: true })
  technicalReviewAssignee: ProposalViewTechnicalReviewAssignee;
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

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus: ProposalEndStatus;

  @Field(() => Boolean)
  public notified: boolean;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => [ProposalViewInstrument], { nullable: true })
  public instruments: ProposalViewInstrument[] | null;

  @Field(() => [ProposalViewTechnicalReview], { nullable: true })
  public technicalReviews: ProposalViewTechnicalReview[] | null;

  @Field(() => [ProposalViewFap], { nullable: true })
  public faps: ProposalViewFap[] | null;

  @Field(() => [FapInstrument], { nullable: true })
  public fapInstruments: FapInstrument[] | null;

  @Field(() => String, { nullable: true })
  public callShortCode: string;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;

  @Field(() => Date, { nullable: true })
  public submittedDate: Date;

  @Field(() => [ProposalViewTechnique], { nullable: true })
  public techniques: ProposalViewTechnique[] | null;
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
