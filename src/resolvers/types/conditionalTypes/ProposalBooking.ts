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

import { ResolverContext } from '../../../context';
import { TzLessDateTime } from '../../CustomScalars';
import { Proposal } from '../Proposal';
import { ScheduledEvent } from '../ScheduledEvent';

function If(condition: boolean, decorator: MethodDecorator): MethodDecorator {
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
  COMMISSIONING = 'COMMISSIONING',
  EQUIPMENT = 'EQUIPMENT',
}

export enum ProposalBookingStatus {
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
export class ProposalBooking {
  @Field(() => Int)
  id: number;
}

@InputType()
export class ProposalBookingScheduledEventFilter {
  @Field(() => ScheduledEventBookingType, { nullable: true })
  bookingType?: ScheduledEventBookingType | null;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAfter?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  endsBefore?: Date;
}

@InputType()
export class ProposalProposalBookingFilter {
  @Field(() => [ProposalBookingStatus], { nullable: true })
  status?: ProposalBookingStatus[] | null;
}

@Resolver(() => ProposalBooking)
export class ProposalBookingResolvers {
  @FieldResolver(() => [ScheduledEvent], { nullable: true })
  scheduledEvents(
    @Ctx() ctx: ResolverContext,
    @Root() proposalBooking: ProposalBooking,
    @Arg('filter') filter: ProposalBookingScheduledEventFilter
  ): Promise<ScheduledEvent[]> | null {
    return null;
  }
}

@Resolver(() => Proposal)
export class ProposalExtended {
  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    FieldResolver(() => ProposalBooking, { nullable: true })
  )
  async proposalBooking(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext,
    @Arg('filter', () => ProposalProposalBookingFilter, { nullable: true })
    filter?: ProposalProposalBookingFilter
  ): Promise<any | null> {
    return null;
  }
}
