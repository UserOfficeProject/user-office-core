import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow } from '../../models/Workflow';
import { WorkflowConnection } from '../../models/WorkflowConnections';
import { WorkflowStatus } from '../../models/WorkflowStatus';
import { CreateWorkflowConnectionInput } from '../../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusInput } from '../../resolvers/mutations/settings/UpdateWorkflowStatusMutation';
import { WorkflowDataSource } from '../WorkflowDataSource';
import database from './database';
import {
  StatusChangingEventRecord,
  WorkflowConnectionRecord,
  WorkflowRecord,
  WorkflowStatusRecord,
} from './records';
import StatusDataSource from './StatusDataSource';

@injectable()
export default class PostgresWorkflowDataSource implements WorkflowDataSource {
  constructor(
    @inject(Tokens.StatusDataSource) private statusDataSource: StatusDataSource
  ) {}

  private createWorkflowObject(workflow: WorkflowRecord) {
    return new Workflow(
      workflow.workflow_id,
      workflow.name,
      workflow.description,
      workflow.entity_type,
      workflow.connection_line_type
    );
  }

  private createWorkflowConnectionObject(
    workflowConnection: WorkflowConnectionRecord
  ) {
    return new WorkflowConnection(
      workflowConnection.workflow_status_connection_id,
      workflowConnection.workflow_id,
      workflowConnection.prev_workflow_status_id,
      workflowConnection.next_workflow_status_id
    );
  }

  private createWorkflowStatusObject(workflowStatus: WorkflowStatusRecord) {
    return new WorkflowStatus(
      workflowStatus.workflow_status_id,
      workflowStatus.workflow_id,
      workflowStatus.status_id,
      workflowStatus.pos_x,
      workflowStatus.pos_y
    );
  }

  async createWorkflow(
    newWorkflowInput: CreateWorkflowInput
  ): Promise<Workflow> {
    const initialStatus = await this.statusDataSource.getInitialStatus(
      newWorkflowInput.entityType
    );

    if (!initialStatus) {
      throw new GraphQLError(
        `Could not find default status for ${newWorkflowInput.entityType}`
      );
    }

    const [workflowRecord]: WorkflowRecord[] = await database
      .insert({
        name: newWorkflowInput.name,
        description: newWorkflowInput.description,
        entity_type: newWorkflowInput.entityType,
      })
      .into('workflows')
      .returning('*');

    if (!workflowRecord) {
      throw new GraphQLError(
        `Could not create workflow ${newWorkflowInput.name}`
      );
    }

    await this.addStatusToWorkflow({
      statusId: initialStatus.id,
      workflowId: workflowRecord.workflow_id,
      posX: 0,
      posY: 0,
    });

    return this.createWorkflowObject(workflowRecord);
  }
  async getWorkflow(workflowId: number): Promise<Workflow | null> {
    return database
      .select()
      .from('workflows')
      .where('workflow_id', workflowId)
      .first()
      .then((workflow: WorkflowRecord | null) =>
        workflow ? this.createWorkflowObject(workflow) : null
      );
  }
  async getAllWorkflows(
    entityType: Workflow['entityType']
  ): Promise<Workflow[]> {
    return database
      .select('*')
      .from('workflows')
      .orderBy('workflow_id', 'asc')
      .where('entity_type', entityType)
      .then((workflows: WorkflowRecord[]) => {
        return workflows.map((workflow) => this.createWorkflowObject(workflow));
      });
  }
  async updateWorkflow(workflow: UpdateWorkflowInput): Promise<Workflow> {
    return database
      .update(
        {
          workflow_id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          connection_line_type: workflow.connectionLineType,
        },
        ['*']
      )
      .from('workflows')
      .where('workflow_id', workflow.id)
      .then((records: WorkflowRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Workflow not found ${workflow.id}`);
        }

        return this.createWorkflowObject(records[0]);
      });
  }
  async deleteWorkflow(workflowId: number): Promise<Workflow> {
    return database('workflows')
      .where('workflow_id', workflowId)
      .del()
      .returning('*')
      .then((workflows: WorkflowRecord[]) => {
        if (workflows === undefined || workflows.length !== 1) {
          throw new GraphQLError(
            `Could not delete workflow with id: ${workflowId} `
          );
        }

        return this.createWorkflowObject(workflows[0]);
      });
  }
  async getWorkflowConnections(
    workflowId: number
  ): Promise<WorkflowConnection[]> {
    const workflowConnections: WorkflowConnectionRecord[] = await database
      .select('*')
      .from('workflow_status_connections')
      .where('workflow_id', workflowId);

    return workflowConnections.map((workflowConnection) =>
      this.createWorkflowConnectionObject(workflowConnection)
    );
  }

  async getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    const workflowStatuses: WorkflowStatusRecord[] = await database
      .select('*')
      .from('workflow_has_statuses')
      .where('workflow_id', workflowId);

    return workflowStatuses.map((workflowStatus) =>
      this.createWorkflowStatusObject(workflowStatus)
    );
  }

  async getWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    const workflowConnection: WorkflowConnectionRecord = await database
      .select('*')
      .from('workflow_status_connections')
      .where('workflow_status_connection_id', connectionId)
      .first();

    return workflowConnection
      ? this.createWorkflowConnectionObject(workflowConnection)
      : null;
  }
  async addStatusToWorkflow(newWorkflowStatusInput: {
    workflowId: number;
    statusId: number;
    posX: number;
    posY: number;
  }): Promise<WorkflowStatus> {
    const workflow = await this.getWorkflow(newWorkflowStatusInput.workflowId);

    if (!workflow) {
      throw new GraphQLError(
        `Could not find workflow with id: ${newWorkflowStatusInput.workflowId}`
      );
    }
    const [workflowStatusRecord]: WorkflowStatusRecord[] = await database
      .insert({
        workflow_id: newWorkflowStatusInput.workflowId,
        status_id: newWorkflowStatusInput.statusId,
        pos_x: newWorkflowStatusInput.posX,
        pos_y: newWorkflowStatusInput.posY,
      })
      .into('workflow_has_statuses')
      .returning('*');

    if (!workflowStatusRecord) {
      throw new GraphQLError('Could not create workflow status');
    }

    return this.createWorkflowStatusObject(workflowStatusRecord);
  }

  async updateWorkflowStatus(
    args: UpdateWorkflowStatusInput
  ): Promise<WorkflowStatus> {
    const [updatedStatus]: WorkflowStatusRecord[] = await database
      .update(
        {
          pos_x: args.posX,
          pos_y: args.posY,
        },
        ['*']
      )
      .from('workflow_has_statuses')
      .where('workflow_status_id', args.workflowStatusId);

    if (!updatedStatus) {
      throw new GraphQLError('Could not update workflow status');
    }

    return this.createWorkflowStatusObject(updatedStatus);
  }

  async createWorkflowConnection(
    newWorkflowConnectionInput: CreateWorkflowConnectionInput
  ): Promise<WorkflowConnection> {
    const prevStatus = await this.getWorkflowStatus(
      newWorkflowConnectionInput.prevWorkflowStatusId
    );

    if (!prevStatus) {
      throw new GraphQLError(
        `Could not find workflow status with id: ${newWorkflowConnectionInput.prevWorkflowStatusId}`
      );
    }

    const nextStatus = await this.getWorkflowStatus(
      newWorkflowConnectionInput.nextWorkflowStatusId
    );

    if (!nextStatus) {
      throw new GraphQLError(
        `Could not find workflow status with id: ${newWorkflowConnectionInput.nextWorkflowStatusId}`
      );
    }

    if (prevStatus.workflowId !== nextStatus.workflowId) {
      throw new GraphQLError(
        'Cannot connect statuses from different workflows'
      );
    }

    const [createdConnection]: WorkflowConnectionRecord[] = await database(
      'workflow_status_connections'
    )
      .insert({
        workflow_id: prevStatus.workflowId,
        prev_workflow_status_id:
          newWorkflowConnectionInput.prevWorkflowStatusId,
        next_workflow_status_id:
          newWorkflowConnectionInput.nextWorkflowStatusId,
      })
      .returning('*');

    if (!createdConnection) {
      throw new GraphQLError('Could not create workflow connection');
    }

    return this.createWorkflowConnectionObject(createdConnection);
  }

  async deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    const [deletedConnection]: WorkflowConnectionRecord[] = await database(
      'workflow_status_connections'
    )
      .where('workflow_status_connection_id', connectionId)
      .del()
      .returning('*');

    if (!deletedConnection) {
      return null;
    }

    return this.createWorkflowConnectionObject(deletedConnection);
  }

  async deleteWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus> {
    const [deletedStatus]: WorkflowStatusRecord[] = await database(
      'workflow_has_statuses'
    )
      .where('workflow_status_id', workflowStatusId)
      .del()
      .returning('*');

    if (!deletedStatus) {
      throw new GraphQLError(
        `Could not delete from workflow_has_statuses with workflow_status_id: ${workflowStatusId} `
      );
    }

    return this.createWorkflowStatusObject(deletedStatus);
  }

  private createStatusChangingEventObject(
    statusChangingEvent: StatusChangingEventRecord
  ) {
    return new StatusChangingEvent(
      statusChangingEvent.status_changing_event_id,
      statusChangingEvent.workflow_connection_id,
      statusChangingEvent.status_changing_event
    );
  }

  async setStatusChangingEventsOnConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    const workflowConnection = await database
      .select()
      .from('workflow_status_connections')
      .where('workflow_status_connection_id', workflowConnectionId)
      .first()
      .then((workflowConnection: WorkflowConnectionRecord | null) =>
        workflowConnection
          ? this.createWorkflowConnectionObject(workflowConnection)
          : null
      );

    if (!workflowConnection) {
      throw new GraphQLError(
        `Could not find workflow connection with id: ${workflowConnectionId}`
      );
    }

    await database(
      'workflow_status_connection_has_workflow_status_changing_events'
    )
      .where('workflow_status_connection_id', workflowConnectionId)
      .del();

    const eventsToReturn: StatusChangingEvent[] = [];

    for (const eventName of statusChangingEvents) {
      let eventId: number;
      const existingEvent = await database('workflow_status_changing_events')
        .select('status_changing_event_id')
        .where('name', eventName)
        .first();

      if (existingEvent) {
        eventId = existingEvent.status_changing_event_id;
      } else {
        throw new GraphQLError(
          `Status changing event with name ${eventName} not found`
        );
      }

      await database(
        'workflow_status_connection_has_workflow_status_changing_events'
      ).insert({
        workflow_status_connection_id: workflowConnectionId,
        status_changing_event_id: eventId,
      });

      eventsToReturn.push(
        new StatusChangingEvent(eventId, workflowConnectionId, eventName)
      );
    }

    return eventsToReturn;
  }

  async getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return database
      .select(
        'wsche.workflow_status_connection_id',
        'wsce.status_changing_event_id',
        'wsce.name'
      )
      .from(
        'workflow_status_connection_has_workflow_status_changing_events as wsche'
      )
      .join(
        'workflow_status_changing_events as wsce',
        'wsche.status_changing_event_id',
        'wsce.status_changing_event_id'
      )
      .whereIn('wsche.workflow_status_connection_id', workflowConnectionIds)
      .then(
        (
          statusChangingEvents: {
            workflow_status_connection_id: number;
            status_changing_event_id: number;
            name: string;
          }[]
        ) => {
          return statusChangingEvents.map((statusChangingEvent) =>
            this.createStatusChangingEventObject({
              status_changing_event_id:
                statusChangingEvent.status_changing_event_id,
              workflow_connection_id:
                statusChangingEvent.workflow_status_connection_id,
              status_changing_event: statusChangingEvent.name,
            })
          );
        }
      );
  }

  async getWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus | null> {
    const workflowStatus: WorkflowStatusRecord = await database
      .select('*')
      .from('workflow_has_statuses')
      .where('workflow_status_id', workflowStatusId)
      .first();

    return workflowStatus
      ? this.createWorkflowStatusObject(workflowStatus)
      : null;
  }
}
