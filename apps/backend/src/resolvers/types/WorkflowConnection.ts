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
import { WorkflowConnection as WorkflowConnectionOrigin } from '../../models/WorkflowConnections';
import { ConnectionStatusAction } from './ConnectionStatusAction';
import { StatusChangingEvent } from './StatusChangingEvent';
import { WorkflowStatus } from './WorkflowStatus';

@ObjectType()
export class WorkflowConnection implements Partial<WorkflowConnectionOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public prevWorkflowStatusId: number;

  @Field(() => Int)
  public nextWorkflowStatusId: number;
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

  @FieldResolver(() => WorkflowStatus)
  async prevStatus(
    @Root() workflowConnection: WorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<WorkflowStatus> {
    const status = await context.queries.workflow.getWorkflowStatus(
      context.user,
      workflowConnection.prevWorkflowStatusId
    );

    if (status === null) {
      throw new Error(
        `Workflow status with id ${workflowConnection.prevWorkflowStatusId} not found`
      );
    }

    return status;
  }

  @FieldResolver(() => WorkflowStatus)
  async nextStatus(
    @Root() workflowConnection: WorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<WorkflowStatus> {
    const status = await context.queries.workflow.getWorkflowStatus(
      context.user,
      workflowConnection.nextWorkflowStatusId
    );

    if (status === null) {
      throw new Error(
        `Workflow status with id ${workflowConnection.nextWorkflowStatusId} not found`
      );
    }

    return status;
  }
}
