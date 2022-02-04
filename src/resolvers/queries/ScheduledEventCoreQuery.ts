import { Resolver, Query, Ctx, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ScheduledEventCore } from '../types/ScheduledEvent';

@Resolver()
export class ScheduledEventQuery {
  @Query(() => ScheduledEventCore, { nullable: true })
  async scheduledEventCore(
    @Arg('scheduledEventId', () => Int) scheduledEventId: number,
    @Ctx() context: ResolverContext
  ): Promise<ScheduledEventCore | null> {
    return context.queries.scheduledEvent.getScheduledEventCore(
      context.user,
      scheduledEventId
    );
  }
}
