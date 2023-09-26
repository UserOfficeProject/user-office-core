import {
  Field,
  Int,
  ObjectType,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
  Arg,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ScheduledEventCore } from './ScheduledEvent';

export function If(
  condition: boolean,
  decorator: MethodDecorator
): MethodDecorator {
  return (...args) => {
    if (condition) {
      return decorator(...args);
    }
  };
}

export enum ScheduledEventBookingType {
  USER_OPERATIONS = 'USER_OPERATIONS',
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  EQUIPMENT = 'EQUIPMENT',
}

export enum ProposalBookingStatusCore {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum EquipmentAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@ObjectType()
export class ProposalBookingCore {
  @Field(() => Int)
  id: number;
}

@InputType()
export class ProposalBookingScheduledEventFilterCore {
  @Field(() => ScheduledEventBookingType, { nullable: true })
  bookingType?: ScheduledEventBookingType | null;

  @Field({ nullable: true })
  endsAfter?: Date;

  @Field({ nullable: true })
  endsBefore?: Date;

  @Field(() => [ProposalBookingStatusCore], { nullable: true })
  status?: ProposalBookingStatusCore[] | null;
}

@InputType()
export class ProposalBookingFilter {
  @Field(() => [ProposalBookingStatusCore], { nullable: true })
  status?: ProposalBookingStatusCore[] | null;
}

@Resolver(() => ProposalBookingCore)
export class ProposalBookingResolvers {
  @FieldResolver(() => [ScheduledEventCore])
  scheduledEvents(
    @Ctx() ctx: ResolverContext,
    @Root() proposalBooking: ProposalBookingCore,
    @Arg('filter') filter: ProposalBookingScheduledEventFilterCore
  ): Promise<ScheduledEventCore[] | null> {
    return ctx.queries.proposal.proposalBookingScheduledEvents(ctx.user, {
      proposalBookingId: proposalBooking.id,
      filter: {
        ...filter,
        bookingType:
          filter.bookingType ?? ScheduledEventBookingType.USER_OPERATIONS,
      },
    });
  }
}
