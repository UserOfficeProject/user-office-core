import {
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
} from '../../models/Proposal';
import { isRejection } from '../../rejection';
import { BasicUserDetails } from './BasicUserDetails';
import { Call } from './Call';
import { Instrument } from './Instrument';
import { ProposalStatus } from './ProposalStatus';
import { Questionary } from './Questionary';
import { Review } from './Review';
import { SEP } from './SEP';
import { TechnicalReview } from './TechnicalReview';

@ObjectType()
@Directive('@key(fields: "id")')
export class Proposal implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public id: number;

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
  public shortCode: string;

  @Field(() => Int, { nullable: true })
  public rankOrder?: number;

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
      proposal.id
    );

    return isRejection(users) ? [] : users;
  }

  @FieldResolver(() => BasicUserDetails)
  async proposer(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return await context.queries.user.getBasic(
      context.user,
      proposal.proposerId
    );
  }

  @FieldResolver(() => ProposalStatus)
  async status(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<ProposalStatus | null> {
    return await context.queries.proposalSettings.getProposalStatus(
      context.user,
      proposal.statusId
    );
  }

  @FieldResolver(() => [Review], { nullable: true })
  async reviews(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Review[] | null> {
    return await context.queries.review.reviewsForProposal(
      context.user,
      proposal.id
    );
  }

  @FieldResolver(() => TechnicalReview, { nullable: true })
  async technicalReview(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<TechnicalReview | null> {
    return await context.queries.review.technicalReviewForProposal(
      context.user,
      proposal.id
    );
  }

  @FieldResolver(() => Instrument, { nullable: true })
  async instrument(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Instrument | null> {
    return await context.queries.instrument.dataSource.getInstrumentByProposalId(
      proposal.id
    );
  }

  @FieldResolver(() => SEP, { nullable: true })
  async sep(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<SEP | null> {
    return await context.queries.sep.dataSource.getSEPByProposalId(proposal.id);
  }

  @FieldResolver(() => Call, { nullable: true })
  async call(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Call | null> {
    return await context.queries.call.dataSource.get(proposal.callId);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    const questionary = await context.queries.questionary.getQuestionary(
      context.user,
      proposal.questionaryId
    );

    return questionary;
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
  const [reference, ctx]: [Pick<Proposal, 'id'>, ResolverContext] = params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.proposal.byRef(
    ctx.user,
    reference.id
  ) as unknown)) as Proposal;
}
