import { Args, Ctx, Field, Query, Resolver, ArgsType } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TzLessDateTime } from '../CustomScalars';
import { ScheduledEventCore } from '../types/ScheduledEvent';

@ArgsType()
export class ScheduledEventsFilter {
  @Field(() => TzLessDateTime, { nullable: true })
  endsBefore?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAfter?: Date;
}

@Resolver()
export class ScheduledEventsQuery {
  @Query(() => [ScheduledEventCore], { nullable: true })
  async scheduledEvents(
    @Args() filter: ScheduledEventsFilter,
    @Ctx() context: ResolverContext
  ): Promise<ScheduledEventCore[] | null> {
    return context.queries.scheduledEvent.getScheduledEvents(
      context.user,
      filter
    );
  }
}
