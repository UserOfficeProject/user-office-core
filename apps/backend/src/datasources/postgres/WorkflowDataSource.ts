import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Status } from '../../models/Status';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow, WorkflowType } from '../../models/Workflow';
import {
  WorkflowConnection,
  NextAndPreviousStatuses,
  WorkflowConnectionWithStatus,
} from '../../models/WorkflowConnections';
import { WorkflowDataSource } from '../WorkflowDataSource';
import database from './database';
import {
  StatusChangingEventRecord,
  StatusRecord,
  WorkflowConnectionRecord,
  WorkflowRecord,
} from './records';

@injectable()
export default class PostgresWorkflowDataSource implements WorkflowDataSource {
  private createWorkflowObject(workflow: WorkflowRecord) {
    return new Workflow(
      workflow.workflow_id,
      workflow.name,
      workflow.description,
      workflow.entity_type
    );
  }

  private createWorkflowConnectionObject(
    workflowConnection: WorkflowConnectionRecord
  ) {
    return new WorkflowConnection(
      workflowConnection.workflow_connection_id,
      workflowConnection.sort_order,
      workflowConnection.workflow_id,
      workflowConnection.status_id,
      workflowConnection.next_status_id,
      workflowConnection.prev_status_id,
      workflowConnection.pos_x,
      workflowConnection.pos_y
    );
  }

  private createWorkflowConnectionWithStatusObject(
    workflowConnection: WorkflowConnectionRecord & StatusRecord
  ) {
    return new WorkflowConnectionWithStatus(
      workflowConnection.workflow_connection_id,
      workflowConnection.sort_order,
      workflowConnection.workflow_id,
      workflowConnection.status_id,
      {
        id: workflowConnection.status_id,
        shortCode: workflowConnection.short_code,
        name: workflowConnection.name,
        description: workflowConnection.description,
        isDefault: workflowConnection.is_default,
        entityType: workflowConnection.entity_type,
      },
      workflowConnection.next_status_id,
      workflowConnection.prev_status_id,
      workflowConnection.pos_x,
      workflowConnection.pos_y
    );
  }
  async createWorkflow(
    newWorkflowInput: Omit<Workflow, 'id'>
  ): Promise<Workflow> {
    let defaultStatusId: number | null = null;

    if (newWorkflowInput.entityType === WorkflowType.PROPOSAL) {
      const defaultProposalStatus = await database()
        .select('status_id')
        .from('statuses')
        .where('is_default', true)
        .andWhere('entity_type', WorkflowType.PROPOSAL)
        .first();

      defaultStatusId = defaultProposalStatus?.status_id;
    } else if (newWorkflowInput.entityType === WorkflowType.EXPERIMENT) {
      const defaultExperimentStatus = await database()
        .select('status_id')
        .from('statuses')
        .where('is_default', true)
        .andWhere('entity_type', WorkflowType.EXPERIMENT)
        .first();

      defaultStatusId = defaultExperimentStatus?.status_id;
    }

    if (!defaultStatusId) {
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
      throw new GraphQLError('Could not create status');
    }

    await this.addWorkflowStatus({
      sortOrder: 0,
      nextStatusId: null,
      prevStatusId: null,
      statusId: defaultStatusId,
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
  async updateWorkflow(
    workflow: Omit<Workflow, 'entityType'>
  ): Promise<Workflow> {
    return database
      .update(
        {
          workflow_id: workflow.id,
          name: workflow.name,
          description: workflow.description,
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
    workflowId: WorkflowConnection['workflowId']
  ): Promise<WorkflowConnectionWithStatus[]> {
    const getUniqueOrderedWorkflowConnectionsQuery = `
      SELECT * FROM (
        SELECT *
        FROM workflow_connections as wc
        LEFT JOIN
          statuses as s
        ON
          s.status_id = wc.status_id
        WHERE workflow_id = ${workflowId}
      ) t
      ORDER BY
        sort_order ASC
    `;

    const workflowConnections:
      | (WorkflowConnectionRecord & StatusRecord)[]
      | null = (await database.raw(getUniqueOrderedWorkflowConnectionsQuery))
      .rows;

    return workflowConnections
      ? workflowConnections.map((workflowConnection) =>
          this.createWorkflowConnectionWithStatusObject(workflowConnection)
        )
      : [];
  }

  async getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnectionWithStatus | null> {
    const query = `
      SELECT wc.*, s.*
      FROM workflow_connections as wc
      LEFT JOIN statuses as s ON s.status_id = wc.status_id
      WHERE wc.workflow_connection_id = ?
    `;

    const result = await database.raw(query, [connectionId]);
    const workflowConnection: (WorkflowConnectionRecord & StatusRecord) | null =
      result.rows[0] || null;

    return workflowConnection
      ? this.createWorkflowConnectionWithStatusObject(workflowConnection)
      : null;
  }
  async getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]> {
    const workflowConnectionRecords: (WorkflowConnectionRecord &
      StatusRecord)[] = await database
      .select()
      .from('workflow_connections as wc')
      .join('statuses as s', {
        's.status_id': 'wc.status_id',
      })
      .where('workflow_id', workflowId)
      .andWhere('wc.status_id', statusId)
      .modify((query) => {
        if (nextStatusId) {
          query.andWhere('wc.next_status_id', nextStatusId);
        }

        if (prevStatusId) {
          query.andWhere('wc.prev_status_id', prevStatusId);
        }

        if (sortOrder) {
          query.andWhere('wc.sort_order', sortOrder);
        }
      });

    if (!workflowConnectionRecords) {
      throw new GraphQLError(
        `Could not find  wkflow connections with statusId: ${statusId}`
      );
    }

    const workflowConnections = workflowConnectionRecords.map(
      (workflowConnectionRecord) =>
        this.createWorkflowConnectionWithStatusObject(workflowConnectionRecord)
    );

    return workflowConnections;
  }
  async addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id' | 'entityType'>
  ): Promise<WorkflowConnectionWithStatus> {
    const workflow = await this.getWorkflow(newWorkflowStatusInput.workflowId);

    if (!workflow) {
      throw new GraphQLError(
        `Could not find workflow with id: ${newWorkflowStatusInput.workflowId}`
      );
    }
    const [workflowConnectionRecord]: (WorkflowConnectionRecord &
      StatusRecord)[] = await database
      .insert({
        workflow_id: newWorkflowStatusInput.workflowId,
        status_id: newWorkflowStatusInput.statusId,
        next_status_id: newWorkflowStatusInput.nextStatusId,
        prev_status_id: newWorkflowStatusInput.prevStatusId,
        sort_order: newWorkflowStatusInput.sortOrder,
        pos_x: newWorkflowStatusInput.posX,
        pos_y: newWorkflowStatusInput.posY,
      })
      .into('workflow_connections as wc')
      .returning('*')
      .join('statuses as s', {
        's.status_id': newWorkflowStatusInput.statusId,
      });
    if (!workflowConnectionRecord) {
      throw new GraphQLError('Could not create workflow status');
    }

    return this.createWorkflowConnectionWithStatusObject(
      workflowConnectionRecord
    );
  }

  async updateWorkflowStatus(connection: WorkflowConnection) {
    const result = await database.raw(
      `WITH updated AS (
        INSERT INTO workflow_connections (
          workflow_connection_id, workflow_id, status_id, next_status_id, 
          prev_status_id, sort_order, pos_x, pos_y
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (workflow_connection_id)
        DO UPDATE SET
          status_id = EXCLUDED.status_id,
          next_status_id = EXCLUDED.next_status_id,
          prev_status_id = EXCLUDED.prev_status_id,
          sort_order = EXCLUDED.sort_order,
          pos_x = EXCLUDED.pos_x,
          pos_y = EXCLUDED.pos_y
        RETURNING *
      )
      SELECT wc.*, s.*
      FROM updated wc
      LEFT JOIN statuses s ON s.status_id = wc.status_id;`,
      [
        connection.id,
        connection.workflowId,
        connection.statusId,
        connection.nextStatusId,
        connection.prevStatusId,
        connection.sortOrder,
        connection.posX,
        connection.posY,
      ]
    );

    if (!result.rows[0]) {
      throw new GraphQLError('Could not update workflow status');
    }

    return this.createWorkflowConnectionWithStatusObject(result.rows[0]);
  }

  async deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnection> {
    const removeWorkflowConnectionQuery = database('workflow_connections')
      .where('workflow_id', workflowId)
      .andWhere('status_id', statusId)
      .andWhere('sort_order', sortOrder)
      .del()
      .returning('*');

    return removeWorkflowConnectionQuery.then(
      (workflowStatus: WorkflowConnectionRecord[]) => {
        if (workflowStatus === undefined || workflowStatus.length < 1) {
          throw new GraphQLError(
            `Could not delete workflow status with id: ${workflowId} `
          );
        }

        // NOTE: I need this object only to be able to reorder and update other statuses in the logic layer.
        return this.createWorkflowConnectionObject({
          ...workflowStatus[0],
        });
      }
    );
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

  async addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    const workflowConnection = await database
      .select()
      .from('workflow_connections')
      .where('workflow_connection_id', workflowConnectionId)
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

    const eventsToInsert = statusChangingEvents.map((statusChangingEvent) => ({
      workflow_connection_id: workflowConnectionId,
      status_changing_event: statusChangingEvent,
    }));

    await database('status_changing_events')
      .where('workflow_connection_id', workflowConnectionId)
      .del();

    const statusChangingEventsResult: StatusChangingEventRecord[] =
      await database('status_changing_events')
        .insert(eventsToInsert)
        .returning(['*']);

    return (
      statusChangingEventsResult?.map((statusChangingEventResult) =>
        this.createStatusChangingEventObject(statusChangingEventResult)
      ) || []
    );
  }

  async getStatusChangingEventsByConnectionIds(
    workflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return database
      .select('*')
      .from('status_changing_events')
      .whereIn('workflow_connection_id', workflowConnectionIds)
      .then((statusChangingEvents: StatusChangingEventRecord[]) => {
        return statusChangingEvents.map((statusChangingEvent) =>
          this.createStatusChangingEventObject(statusChangingEvent)
        );
      });
  }
}
