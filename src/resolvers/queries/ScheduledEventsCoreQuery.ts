import { Args, Ctx, Field, Query, Resolver, ArgsType } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TzLessDateTime } from '../CustomScalars';
import { ScheduledEventCore } from '../types/ScheduledEvent';

@ArgsType()
export class ScheduledEventsCoreFilter {
  @Field(() => TzLessDateTime, { nullable: true })
  endsBefore?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAfter?: Date;
}

@Resolver()
export class ScheduledEventsCoreQuery {
  @Query(() => [ScheduledEventCore], { nullable: true })
  async scheduledEventsCore(
    @Args() filter: ScheduledEventsCoreFilter,
    @Ctx() context: ResolverContext
  ): Promise<ScheduledEventCore[] | null> {
    return context.queries.scheduledEvent.getScheduledEventsCore(
      context.user,
      filter
    );
  }
}
