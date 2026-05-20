import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ConnectionStatusAction } from './ConnectionStatusAction';
import { Status } from './Status';
import { StatusChangingEvent } from './StatusChangingEvent';
import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { WorkflowConnectionWithStatus as WorkflowConnectionWithStatusOrigin } from '../../models/WorkflowConnections';

@ObjectType()
export class WorkflowConnection
  implements Partial<WorkflowConnectionWithStatusOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Status)
  public status: Status;

  @Field(() => Int, { nullable: true })
  public nextStatusId: number | null;

  @Field(() => Int, { nullable: true })
  public prevStatusId: number | null;

  @Field(() => Int)
  public posX: number;

  @Field(() => Int)
  public posY: number;

  @Field(() => Int, { nullable: true })
  public prevConnectionId: number | null;
}

@Resolver(() => WorkflowConnection)
export class WorkflowConnectionResolver {
  @FieldResolver(() => [StatusChangingEvent], { nullable: true })
  async statusChangingEvents(
    @Root() workflowConnection: WorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<StatusChangingEvent[]> {
    const statusChangingEvents =
      await context.queries.workflow.getStatusChangingEventsByConnectionId(
        context.user,
        workflowConnection.id
      );

    return isRejection(statusChangingEvents) ? [] : statusChangingEvents;
  }

  @FieldResolver(() => [ConnectionStatusAction], { nullable: true })
  async statusActions(
    @Root() workflowConnection: WorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<ConnectionStatusAction[]> {
    const statusActions =
      await context.queries.statusAction.getConnectionStatusActions(
        context.user,
        {
          connectionId: workflowConnection.id,
          workflowId: workflowConnection.workflowId,
        }
      );

    return isRejection(statusActions) ? [] : statusActions;
  }
}
