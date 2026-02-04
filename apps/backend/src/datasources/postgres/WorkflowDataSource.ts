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
  WorkflowStructure,
} from './records';
import StatusDataSource from './StatusDataSource';

@injectable()
export default class PostgresWorkflowDataSource implements WorkflowDataSource {
  private workflowStructureCache = new Map<
    number,
    {
      updatedAt: number;
      structure: WorkflowStructure;
    }
  >();

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
      workflowConnection.next_workflow_status_id,
      workflowConnection.source_handle,
      workflowConnection.target_handle
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

  async updateWorkflowTimestamp(workflowId: number): Promise<void> {
    await database
      .update({
        updated_at: new Date(),
      })
      .from('workflows')
      .where('workflow_id', workflowId);
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

        this.workflowStructureCache.delete(workflowId);

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

  async getDefaultWorkflowStatus(
    workflowId: number
  ): Promise<WorkflowStatus | null> {
    const workflow = await database
      .select()
      .from('workflows')
      .where('workflow_id', workflowId)
      .first();

    if (!workflow) {
      throw new GraphQLError(`Workflow not found with id: ${workflowId}`);
    }

    const defaultStatus = await this.statusDataSource.getInitialStatus(
      workflow.entity_type
    );

    if (!defaultStatus) {
      return null;
    }

    const workflowStatus: WorkflowStatusRecord | null = await database
      .select()
      .from('workflow_has_statuses')
      .where('workflow_id', workflowId)
      .andWhere('status_id', defaultStatus.id)
      .first();

    if (!workflowStatus) {
      return null;
    }

    return this.createWorkflowStatusObject(workflowStatus);
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
    statusId: string;
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

    await this.updateWorkflowTimestamp(newWorkflowStatusInput.workflowId);

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

    await this.updateWorkflowTimestamp(updatedStatus.workflow_id);

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
        `Cannot connect statuses from different workflows previous status belongs to workflow id: ${prevStatus.workflowId} while next status belongs to workflow id: ${nextStatus.workflowId}`
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
        source_handle: newWorkflowConnectionInput.sourceHandle,
        target_handle: newWorkflowConnectionInput.targetHandle,
      })
      .returning('*');

    if (!createdConnection) {
      throw new GraphQLError('Could not create workflow connection');
    }

    await this.updateWorkflowTimestamp(createdConnection.workflow_id);

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

    await this.updateWorkflowTimestamp(deletedConnection.workflow_id);

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

    await this.updateWorkflowTimestamp(deletedStatus.workflow_id);

    return this.createWorkflowStatusObject(deletedStatus);
  }

  private createStatusChangingEventObject(
    statusChangingEvent: StatusChangingEventRecord
  ) {
    return new StatusChangingEvent(
      statusChangingEvent.workflow_status_connection_id,
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
      await database(
        'workflow_status_connection_has_workflow_status_changing_events'
      ).insert({
        workflow_status_connection_id: workflowConnectionId,
        status_changing_event: eventName,
      });

      eventsToReturn.push(
        new StatusChangingEvent(workflowConnectionId, eventName)
      );
    }

    if (workflowConnection) {
      await this.updateWorkflowTimestamp(workflowConnection.workflowId);
    }

    return eventsToReturn;
  }

  async getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return database
      .select('workflow_status_connection_id', 'status_changing_event')
      .from('workflow_status_connection_has_workflow_status_changing_events')
      .whereIn('workflow_status_connection_id', workflowConnectionIds)
      .then((statusChangingEvents: StatusChangingEventRecord[]) => {
        return statusChangingEvents.map((statusChangingEvent) =>
          this.createStatusChangingEventObject(statusChangingEvent)
        );
      });
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

  async getWorkflowStructure(workflowId: number): Promise<WorkflowStructure> {
    const workflow = await database
      .select('updated_at')
      .from('workflows')
      .where('workflow_id', workflowId)
      .first();

    if (!workflow) {
      throw new GraphQLError(`Workflow not found with id: ${workflowId}`);
    }

    const cacheEntry = this.workflowStructureCache.get(workflowId);
    if (
      cacheEntry &&
      workflow.updated_at &&
      cacheEntry.updatedAt === new Date(workflow.updated_at).getTime()
    ) {
      return cacheEntry.structure;
    }

    const workflowStatuses = await database
      .select(
        'workflow_has_statuses.workflow_status_id as workflowStatusId',
        'workflow_has_statuses.status_id as statusId'
      )
      .from('workflow_has_statuses')
      .join('statuses', 'workflow_has_statuses.status_id', 'statuses.status_id')
      .where('workflow_has_statuses.workflow_id', workflowId);

    const workflowConnections = await database
      .select(
        'workflow_status_connections.workflow_status_connection_id as workflowStatusConnectionId',
        'workflow_status_connections.prev_workflow_status_id as prevWorkflowStatusId',
        'workflow_status_connections.next_workflow_status_id as nextWorkflowStatusId',
        'workflow_status_connection_has_workflow_status_changing_events.status_changing_event as statusChangingEvent'
      )
      .from('workflow_status_connections')
      .leftJoin(
        'workflow_status_connection_has_workflow_status_changing_events',
        'workflow_status_connections.workflow_status_connection_id',
        'workflow_status_connection_has_workflow_status_changing_events.workflow_status_connection_id'
      )
      .where('workflow_status_connections.workflow_id', workflowId);

    const normalizedWorkflowConnectionsMap = new Map<
      number,
      {
        workflowStatusConnectionId: number;
        prevWorkflowStatusId: number;
        nextWorkflowStatusId: number;
        statusChangingEvents: string[];
      }
    >();

    workflowConnections.forEach((wc) => {
      const existingConnection = normalizedWorkflowConnectionsMap.get(
        wc.workflowStatusConnectionId
      );

      if (!existingConnection) {
        normalizedWorkflowConnectionsMap.set(wc.workflowStatusConnectionId, {
          workflowStatusConnectionId: wc.workflowStatusConnectionId,
          prevWorkflowStatusId: wc.prevWorkflowStatusId,
          nextWorkflowStatusId: wc.nextWorkflowStatusId,
          statusChangingEvents: [],
        });
      }

      if (wc.statusChangingEvent) {
        normalizedWorkflowConnectionsMap
          .get(wc.workflowStatusConnectionId)!
          .statusChangingEvents.push(wc.statusChangingEvent);
      }
    });

    const normalizedWorkflowConnections = Array.from(
      normalizedWorkflowConnectionsMap.values()
    );

    if (workflow.updated_at) {
      this.workflowStructureCache.set(workflowId, {
        updatedAt: new Date(workflow.updated_at).getTime(),
        structure: {
          workflowStatuses,
          workflowConnections: normalizedWorkflowConnections,
        },
      });
    }

    return {
      workflowStatuses,
      workflowConnections: normalizedWorkflowConnections,
    };
  }
}
