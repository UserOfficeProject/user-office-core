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
import { EventLog as EventLogOrigin } from '../../models/EventLog';
import { User } from './User';

@ObjectType()
export class EventLog {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public eventType: string;

  @Field(() => String)
  public rowData: string;

  @Field(() => Date)
  public eventTStamp: Date;

  @Field(() => String)
  public changedObjectId: string;
}

@Resolver((of) => EventLog)
export class EventLogResolver {
  @FieldResolver(() => User)
  async changedBy(
    @Root() eventLog: EventLogOrigin,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    return await context.queries.user.getUser(context.user, eventLog.changedBy);
  }
}
