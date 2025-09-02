import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { WorkflowConnection as WorkflowConnectionOrigin } from '../../models/Workflow';
import { ConnectionStatusAction } from './ConnectionStatusAction';
import { StatusChangingEvent } from './StatusChangingEvent';

@ObjectType()
export class WorkflowConnection implements Partial<WorkflowConnectionOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public nextWorkflowStatusId: number;

  @Field(() => Int)
  public prevWorkflowStatusId: number;
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
