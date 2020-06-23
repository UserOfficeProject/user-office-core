import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Proposal as ProposalOrigin } from '../../models/Proposal';
import { ProposalStatus } from '../../models/ProposalModel';
import { ProposalEndStatus } from '../../models/ProposalModel';
import { isRejection } from '../../rejection';
import { BasicUserDetails } from './BasicUserDetails';
import { Instrument } from './Instrument';
import { Questionary } from './Questionary';
import { Review } from './Review';
import { TechnicalReview } from './TechnicalReview';

@ObjectType()
export class Proposal implements Partial<ProposalOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public abstract: string;

  @Field(() => ProposalStatus)
  public status: ProposalStatus;

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

  public proposerId: number;
}

@Resolver(of => Proposal)
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

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    if (proposal.status === ProposalStatus.BLANK) {
      const call = await context.queries.call.get(
        context.user,
        proposal.callId
      );
      if (!call?.templateId) {
        return null;
      }

      return await context.queries.questionary.getBlankQuestionary(
        context.user,
        call.templateId
      );
    } else {
      const questionary = await context.queries.questionary.getQuestionary(
        context.user,
        proposal.questionaryId
      );

      return isRejection(questionary) ? null : questionary;
    }
  }
}
