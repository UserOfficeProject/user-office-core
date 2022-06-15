import { Query, Ctx, Resolver, ArgsType, Field, Args } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EventLog } from '../types/EventLog';

@ArgsType()
class EventLogArgs {
  @Field()
  public changedObjectId: string;

  @Field()
  public eventType: string;
}

@Resolver()
export class EventLogQuery {
  @Query(() => [EventLog], { nullable: true })
  async eventLogs(@Args() args: EventLogArgs, @Ctx() context: ResolverContext) {
    return context.queries.eventLogs.getAll(context.user, args);
  }
}
