import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { User } from './User';
import { ResolverContext } from '../../context';
import { EventLog as EventLogOrigin } from "../../models/EventLog";

@ObjectType()
export class EventLog {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public eventType: string;

  @Field(() => String)
  public rowData: String;

  @Field(() => Date)
  public eventTStamp: Date;

  @Field(() => String)
  public changedObjectId: String;
}

@Resolver(of => EventLog)
export class EventLogResolver {
  @FieldResolver(() => User)
  async changedBy(
    @Root() eventLog: EventLogOrigin,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    return await context.queries.user.getUser(
      eventLog.changedBy
    );
  }
}
