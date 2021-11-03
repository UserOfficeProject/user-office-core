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
import { ExperimentSafetyInput } from './ExperimentSafetyInput';
import { ScheduledEventBookingType } from './ProposalBooking';
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
}
