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
import { ExperimentSafety } from './ExperimentSafety';
import { Feedback } from './Feedback';
import { FeedbackRequest } from './FeedbackRequest';
import { Instrument } from './Instrument';
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

  @Field(() => Int, { nullable: true })
  instrumentId?: number | null;
}

@Resolver(() => ScheduledEventCore)
export class ScheduledEventResolver {
  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return null;
  }

  @FieldResolver(() => Feedback, { nullable: true }) //todo: removed
  async feedback(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<Feedback | null> {
    return null;
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

  @FieldResolver(() => ExperimentSafety, { nullable: true })
  async esi(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentSafety | null> {
    const esi = await context.queries.proposalEsi.getEsis(context.user, {
      scheduledEventId: event.id,
    });

    return null;
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
      filter: { experimentPk: event.id },
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

  @FieldResolver(() => Instrument, { nullable: true })
  async instrument(
    @Root() event: ScheduledEventCore,
    @Ctx() context: ResolverContext
  ) {
    if (!event.instrumentId) {
      return null;
    }

    return context.queries.instrument.get(context.user, event.instrumentId);
  }
}
