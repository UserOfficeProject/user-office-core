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
import { GenericTemplate } from './GenericTemplate';
import { Instrument } from './Instrument';
import { ProposalBookingCore, ProposalBookingFilter } from './ProposalBooking';
import { ProposalStatus } from './ProposalStatus';
import { Questionary } from './Questionary';
import { Review } from './Review';
import { Sample } from './Sample';
import { SEP } from './SEP';
import { SepMeetingDecision } from './SepMeetingDecision';
import { TechnicalReview } from './TechnicalReview';
import { Visit } from './Visit';

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

  @Field(() => Int, { nullable: true })
  public managementTimeAllocation: number;

  @Field(() => Boolean)
  public managementDecisionSubmitted: boolean;

  public proposerId: number;
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
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<ProposalPublicStatus> {
    return context.queries.proposal.getPublicStatus(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => [Review], { nullable: true })
  async reviews(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Review[] | null> {
    return await context.queries.review.reviewsForProposal(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => TechnicalReview, { nullable: true })
  async technicalReview(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<TechnicalReview | null> {
    return await context.queries.review.technicalReviewForProposal(
      context.user,
      proposal.primaryKey
    );
  }

  @FieldResolver(() => Instrument, { nullable: true })
  async instrument(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Instrument | null> {
    return await context.queries.instrument.dataSource.getInstrumentByProposalPk(
      proposal.primaryKey
    );
  }

  @FieldResolver(() => SEP, { nullable: true })
  async sep(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<SEP | null> {
    return await context.queries.sep.dataSource.getSEPByProposalPk(
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

  @FieldResolver(() => SepMeetingDecision, { nullable: true })
  async sepMeetingDecision(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<SepMeetingDecision | null> {
    return await context.queries.sep.getProposalSepMeetingDecision(
      context.user,
      proposal.primaryKey
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
  @FieldResolver(() => ProposalBookingCore, { nullable: true })
  proposalBookingCore(
    @Root() proposal: Proposal,
    @Ctx() ctx: ResolverContext,
    @Arg('filter', () => ProposalBookingFilter, { nullable: true })
    filter?: ProposalBookingFilter
  ) {
    return ctx.queries.proposal.getProposalBookingByProposalPk(ctx.user, {
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
