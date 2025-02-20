import { Field, Int, ObjectType, InputType } from 'type-graphql';

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

export enum ExperimentStatus {
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
export class ProposalBookingsCore {
  @Field(() => [Int])
  ids: number[];
}

@InputType()
export class ProposalBookingScheduledEventFilterCore {
  @Field(() => ScheduledEventBookingType, { nullable: true })
  bookingType?: ScheduledEventBookingType | null;

  @Field({ nullable: true })
  endsAfter?: Date;

  @Field({ nullable: true })
  endsBefore?: Date;

  @Field(() => [ExperimentStatus], { nullable: true })
  status?: ExperimentStatus[] | null;
}

@InputType()
export class ProposalBookingFilter {
  @Field(() => [ExperimentStatus], { nullable: true })
  status?: ExperimentStatus[] | null;
}
