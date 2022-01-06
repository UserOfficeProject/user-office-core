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
import { TzLessDateTime } from '../CustomScalars';
import { BasicUserDetails } from './BasicUserDetails';
import { ExperimentSafetyInput } from './ExperimentSafetyInput';
import { Feedback } from './Feedback';
import {
  ProposalBookingStatusCore,
  ScheduledEventBookingType,
} from './ProposalBooking';
import { Visit } from './Visit';

@ObjectType()
export class ScheduledEventCore {
  @Field(() => Int)
  id: number;

  @Field(() => ScheduledEventBookingType)
  bookingType: ScheduledEventBookingType;

  @Field(() => TzLessDateTime)
  startsAt: Date;

  @Field(() => TzLessDateTime)
  endsAt: Date;

  @Field(() => ProposalBookingStatusCore)
  status: ProposalBookingStatusCore;

  @Field(() => Int, { nullable: true })
  localContactId: number | null;
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
}
