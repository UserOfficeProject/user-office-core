import {
  Arg,
  Ctx,
  Directive,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  Proposal as ProposalOrigin,
  ProposalEndStatus,
  ProposalPublicStatus,
} from '../../models/Proposal';
import { isRejection } from '../../models/Rejection';
import { TemplateCategoryId } from '../../models/Template';
import { BasicUserDetails } from './BasicUserDetails';
import { Call } from './Call';
import { Fap } from './Fap';
import { FapMeetingDecision } from './FapMeetingDecision';
import { GenericTemplate } from './GenericTemplate';
import { InstrumentWithManagementTime } from './Instrument';
import { Invite } from './Invite';
import { ProposalBookingsCore, ProposalBookingFilter } from './ProposalBooking';
import { ProposalStatus } from './ProposalStatus';
import { Questionary } from './Questionary';
import { Review } from './Review';
import { Sample } from './Sample';
import { TechnicalReview } from './TechnicalReview';
import { Technique } from './Technique';
import { Visit } from './Visit';

const statusMap = new Map<ProposalEndStatus, ProposalPublicStatus>();
statusMap.set(ProposalEndStatus.ACCEPTED, ProposalPublicStatus.accepted);
statusMap.set(ProposalEndStatus.REJECTED, ProposalPublicStatus.rejected);
statusMap.set(ProposalEndStatus.RESERVED, ProposalPublicStatus.reserved);

@ObjectType()
@Directive('@key(fields: "primaryKey")')
export class Proposal implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public primaryKey: number;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public abstract: string;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Date)
  public created: Date;

  @Field(() => Date)
  public updated: Date;

  @Field(() => String)
  public proposalId: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus?: ProposalEndStatus;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => String, { nullable: true })
  public commentForUser: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => Boolean)
  public notified: boolean;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Boolean)
  public managementDecisionSubmitted: boolean;

  @Field(() => Int)
  public proposerId: number;

  @Field(() => Date, { nullable: true })
  public submittedDate?: Date | null;
}

@Resolver(() => Proposal)
export class ProposalResolver {
  @FieldResolver(() => [BasicUserDetails])
  async users(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[]> {
    const users = await context.queries.user.getProposers(
      context.user,
      proposal.primaryKey
    );

    return isRejection(users) ? [] : users;
  }

  @FieldResolver(() => [Invite])
  async coProposerInvites(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Invite[] | null> {
    const invites = await context.queries.invite.getCoProposerInvites(
      context.user,
      proposal.primaryKey
    );

    return invites;
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async proposer(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return await context.queries.user.getBasic(
      context.user,
      proposal.proposerId
    );
  }

  @FieldResolver(() => ProposalStatus, { nullable: true })
  async status(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<ProposalStatus | null> {
    return await context.queries.proposalSettings.getProposalStatus(
      context.user,
      proposal.statusId
    );
  }

  @FieldResolver(() => ProposalPublicStatus)
  async publicStatus(
    @Root() proposal: ProposalOrigin
  ): Promise<ProposalPublicStatus> {
    return proposal.submitted
      ? statusMap.get(proposal.finalStatus) || ProposalPublicStatus.submitted
      : ProposalPublicStatus.draft;
  }

  @FieldResolver(() => [Review], { nullable: true })
  async reviews(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext,
    @Arg('fapId', () => Int, { nullable: true }) fapId?: number
  ): Promise<Review[] | null> {
    return await context.queries.review.reviewsForProposal(context.user, {
      proposalPk: proposal.primaryKey,
      fapId: fapId,
    });
  }

  @FieldResolver(() => [TechnicalReview])
  async technicalReviews(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<TechnicalReview[]> {
    return await context.queries.technicalReview.reviewsForProposal(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => [InstrumentWithManagementTime], {
    nullable: 'itemsAndList',
  })
  async instruments(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<InstrumentWithManagementTime[]> {
    return await context.queries.instrument.getInstrumentsByProposalPk(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => [Technique], {
    nullable: 'itemsAndList',
  })
  async techniques(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Technique[]> {
    return await context.queries.technique.getTechniquesByProposalPk(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => [Fap], { nullable: true })
  async faps(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Fap[] | null> {
    return await context.queries.fap.dataSource.getFapsByProposalPk(
      proposal.primaryKey
    );
  }

  @FieldResolver(() => Call, { nullable: true })
  async call(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Call | null> {
    return await context.queries.call.dataSource.getCall(proposal.callId);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      proposal.questionaryId,
      TemplateCategoryId.PROPOSAL_QUESTIONARY
    );
  }

  @FieldResolver(() => [FapMeetingDecision], { nullable: true })
  async fapMeetingDecisions(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext,
    @Arg('fapId', () => Int, { nullable: true }) fapId?: number
  ): Promise<FapMeetingDecision[]> {
    return await context.queries.fap.getProposalFapMeetingDecisions(
      context.user,
      { proposalPk: proposal.primaryKey, fapId: fapId }
    );
  }

  @FieldResolver(() => [Sample], { nullable: true })
  async samples(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Sample[] | null> {
    return await context.queries.sample.getSamples(context.user, {
      filter: { proposalPk: proposal.primaryKey },
    });
  }

  @FieldResolver(() => [GenericTemplate], { nullable: true })
  async genericTemplates(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<GenericTemplate[] | null> {
    return await context.queries.genericTemplate.getGenericTemplates(
      context.user,
      {
        filter: { proposalPk: proposal.primaryKey },
      }
    );
  }

  @FieldResolver(() => [Visit], { nullable: true })
  async visits(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Visit[] | null> {
    return await context.queries.visit.getMyVisits(context.user, {
      proposalPk: proposal.primaryKey,
    });
  }
  @FieldResolver(() => ProposalBookingsCore, { nullable: true })
  proposalBookingsCore(
    @Root() proposal: Proposal,
    @Ctx() ctx: ResolverContext,
    @Arg('filter', () => ProposalBookingFilter, { nullable: true })
    filter?: ProposalBookingFilter
  ) {
    return ctx.queries.proposal.getProposalBookingsByProposalPk(ctx.user, {
      proposalPk: proposal.primaryKey,
      filter,
    });
  }
}

export async function resolveProposalReference(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...params: any
): Promise<Proposal> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easies way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<Proposal, 'primaryKey'>, ResolverContext] =
    params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.proposal.byRef(
    ctx.user,
    reference.primaryKey
  ) as unknown)) as Proposal;
}
