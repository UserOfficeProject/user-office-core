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
import { TzLessDateTime } from '../CustomScalars';
import {
  ProposalBookingStatus,
  ScheduledEventBookingType,
} from './conditionalTypes/ProposalBooking';
import { Instrument } from './Instrument';
import { User } from './User';
import { Visit } from './Visit';

function If(
  condition: boolean,
  decorator: PropertyDecorator
): PropertyDecorator {
  return (...args) => {
    if (condition) {
      return decorator(...args);
    }
  };
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class ScheduledEvent {
  @Field(() => Int)
  @Directive('@external')
  id: number;

  @If(process.env.DEPENDENCY_CONFIG === 'stfc', Field(() => Date))
  createdAt: Date;

  @If(process.env.DEPENDENCY_CONFIG === 'stfc', Field(() => Date))
  updatedAt: Date;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => ScheduledEventBookingType)
  )
  bookingType: ScheduledEventBookingType;

  @If(process.env.DEPENDENCY_CONFIG === 'stfc', Field(() => TzLessDateTime))
  startsAt: Date;

  @If(process.env.DEPENDENCY_CONFIG === 'stfc', Field(() => TzLessDateTime))
  endsAt: Date;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => Int, { nullable: true })
  )
  proposalBookingId: number | null;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => User, { nullable: true })
  )
  scheduledBy?: User;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => String, { nullable: true })
  )
  description?: string | null;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => Instrument, { nullable: true })
  )
  instrument?: Instrument;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => Int, { nullable: true })
  )
  equipmentId?: number;

  @If(
    process.env.DEPENDENCY_CONFIG === 'stfc',
    Field(() => ProposalBookingStatus)
  )
  status: ProposalBookingStatus;
}

@Resolver(() => ScheduledEvent)
export class ScheduledEventResolver {
  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() event: ScheduledEvent,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return context.queries.visit.getVisitByScheduledEventId(
      context.user,
      event.id
    );
  }
}
