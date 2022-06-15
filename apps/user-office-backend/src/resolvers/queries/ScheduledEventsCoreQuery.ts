import {
  Args,
  Ctx,
  Field,
  Query,
  Resolver,
  ArgsType,
  Int,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ScheduledEventCore } from '../types/ScheduledEvent';

@InputType()
class TimeSpan {
  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;
}
@InputType()
export class ScheduledEventsCoreFilter {
  @Field({ nullable: true })
  endsBefore?: Date;

  @Field({ nullable: true })
  endsAfter?: Date;

  @Field({ nullable: true })
  startsBefore?: Date;

  @Field({ nullable: true })
  startsAfter?: Date;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;

  @Field(() => TimeSpan, { nullable: true })
  overlaps?: TimeSpan;
}

@ArgsType()
export class ScheduledEventsCoreArgs {
  @Field(() => ScheduledEventsCoreFilter, { nullable: true })
  filter?: ScheduledEventsCoreFilter;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

@Resolver()
export class ScheduledEventsCoreQuery {
  @Query(() => [ScheduledEventCore])
  async scheduledEventsCore(
    @Args() args: ScheduledEventsCoreArgs,
    @Ctx() context: ResolverContext
  ): Promise<ScheduledEventCore[]> {
    return context.queries.scheduledEvent.getScheduledEventsCore(
      context.user,
      args
    );
  }
}
