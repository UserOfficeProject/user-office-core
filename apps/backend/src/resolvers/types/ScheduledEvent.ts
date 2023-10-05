import { container } from 'tsyringe';
import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { Tokens } from '../../config/Tokens';
import { ResolverContext } from '../../context';
import { FeedbackDataSource } from './../../datasources/FeedbackDataSource';
import { BasicUserDetails } from './BasicUserDetails';
import { ExperimentSafetyInput } from './ExperimentSafetyInput';
import { Feedback } from './Feedback';
import { FeedbackRequest } from './FeedbackRequest';
import { Proposal } from './Proposal';
import {
  ProposalBookingStatusCore,
  ScheduledEventBookingType,
} from './ProposalBooking';
import { Shipment } from './Shipment';
import { Visit } from './Visit';

@ObjectType()
export class ScheduledEventCore {
  @Field(() => Int)
  id: number;

  @Field(() => ScheduledEventBookingType)
  bookingType: ScheduledEventBookingType;

  @Field()
  startsAt: Date;

  @Field()
  endsAt: Date;

  @Field(() => ProposalBookingStatusCore)
  status: ProposalBookingStatusCore;

  @Field(() => Int, { nullable: true })
  localContactId: number | null;

  @Field(() => Int, { nullable: true })
  proposalPk: number | null;
}

@Resolver(() => ScheduledEventCore)
export class ScheduledEventResolver {
  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return context.queries.visit.getVisitByScheduledEventId(
      context.user,
      event.id
    );
  }

  @FieldResolver(() => Feedback, { nullable: true })
  async feedback(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Feedback | null> {
    return context.queries.feedback.getFeedbackByScheduledEventId(
      context.user,
      event.id
    );
  }

  @FieldResolver(() => [FeedbackRequest])
  async feedbackRequests(
    @Root() event: ScheduledEventCore
  ): Promise<FeedbackRequest[] | null> {
    const feedbackDataSource = container.resolve<FeedbackDataSource>(
      Tokens.FeedbackDataSource
    );

    return feedbackDataSource.getFeedbackRequests(event.id);
  }

  @FieldResolver(() => ExperimentSafetyInput, { nullable: true })
  async esi(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentSafetyInput | null> {
    const esi = await context.queries.proposalEsi.getEsis(context.user, {
      scheduledEventId: event.id,
    });

    return esi ? esi[0] : null;
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async localContact(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return event.localContactId
      ? context.queries.user.getBasic(context.user, event.localContactId)
      : null;
  }

  @FieldResolver(() => [Shipment])
  async shipments(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Shipment[] | null> {
    return context.queries.shipment.getShipments(context.user, {
      filter: { scheduledEventId: event.id },
    });
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    if (!event.proposalPk) {
      return null;
    }

    return context.queries.proposal.get(context.user, event.proposalPk);
  }
}
