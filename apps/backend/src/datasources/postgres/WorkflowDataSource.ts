import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { Workflow, WorkflowStatus, WorkflowType } from '../../models/Workflow';
import { WorkflowConnection } from '../../models/Workflow';
import { AddStatusToWorkflowArgs } from '../../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowConnectionArgs } from '../../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { UpdateWorkflowInput } from '../../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusArgs } from '../../resolvers/mutations/settings/UpdateWorkflowStatusMutation';
import { WorkflowDataSource } from '../WorkflowDataSource';
import database from './database';
import {
  StatusChangingEventRecord,
  StatusRecord,
  WorkflowConnectionRecord,
  WorkflowRecord,
  WorkflowStatusRecord,
} from './records';

@injectable()
export default class PostgresWorkflowDataSource implements WorkflowDataSource {
  async getWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    return database
      .select('*')
      .from('workflow_has_statuses')
      .where('workflow_id', workflowId)
      .orderBy('workflow_status_id', 'asc')
      .then((workflowStatuses: WorkflowStatusRecord[]) => {
        return workflowStatuses.map((workflowStatus) =>
          this.createWorkflowStatusObject(workflowStatus)
        );
      });
  }
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

  private createWorkflowStatusObject = (record: WorkflowStatusRecord) => {
    return new WorkflowStatus(
      record.workflow_status_id,
      record.workflow_id,
      record.status_id,
      record.pos_x,
      record.pos_y
    );
  };

  async createWorkflow(
    newWorkflowInput: CreateWorkflowInput
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

    await this.addStatusToWorkflow({
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
    workflowId: WorkflowConnection['workflowId']
  ): Promise<WorkflowConnection[]> {
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
          this.createWorkflowConnectionObject(workflowConnection)
        )
      : [];
  }

  async getWorkflowConnection(
    connectionId: WorkflowConnection['id']
  ): Promise<WorkflowConnection | null> {
    const query = `
      SELECT wc.*
      FROM workflow_connections as wc
      WHERE wc.workflow_connection_id = ?
    `;

    const result = await database.raw(query, [connectionId]);
    const workflowConnection: (WorkflowConnectionRecord & StatusRecord) | null =
      result.rows[0] || null;

    return workflowConnection
      ? this.createWorkflowConnectionObject(workflowConnection)
      : null;
  }
  async addStatusToWorkflow(
    newWorkflowStatusArgs: AddStatusToWorkflowArgs
  ): Promise<WorkflowStatus> {
    const workflow = await this.getWorkflow(newWorkflowStatusArgs.workflowId);

    if (!workflow) {
      throw new GraphQLError(
        `Could not find workflow with id: ${newWorkflowStatusArgs.workflowId}`
      );
    }
    const [workflowConnectionRecord]: WorkflowStatusRecord[] = await database
      .insert({
        workflow_id: newWorkflowStatusArgs.workflowId,
        status_id: newWorkflowStatusArgs.statusId,
        pos_x: newWorkflowStatusArgs.posX,
        pos_y: newWorkflowStatusArgs.posY,
      })
      .into('workflow_has_statuses as whs')
      .returning('*');

    if (!workflowConnectionRecord) {
      throw new GraphQLError('Could not create workflow status');
    }

    return this.createWorkflowStatusObject(workflowConnectionRecord);
  }

  async removeStatusFromWorkflow(
    workflowStatusId: number
  ): Promise<WorkflowStatus> {
    const removedStatuses: WorkflowStatusRecord[] = await database
      .from('workflow_has_statuses')
      .where('workflow_status_id', workflowStatusId)
      .del()
      .returning('*');

    if (removedStatuses.length === 0) {
      throw new GraphQLError(
        `Could not delete workflow status with id: ${workflowStatusId} `
      );
    }

    return this.createWorkflowStatusObject(removedStatuses[0]);
  }

  async updateWorkflowStatus(args: UpdateWorkflowStatusArgs) {
    const updatedStatuses: WorkflowStatusRecord[] = await database
      .from('workflow_has_statuses')
      .where('workflow_status_id', args.workflowStatusId)
      .update(
        {
          pos_x: args.posX,
          pos_y: args.posY,
        },
        ['*']
      );

    if (updatedStatuses.length === 0) {
      throw new GraphQLError(
        `Could not update workflow status with id: ${args.workflowStatusId} `
      );
    }

    return this.createWorkflowStatusObject(updatedStatuses[0]);
  }

  async createWorkflowConnection(
    args: CreateWorkflowConnectionArgs
  ): Promise<WorkflowConnection> {
    const workflow = await this.getWorkflow(args.workflowId);

    if (!workflow) {
      throw new GraphQLError(
        `Could not find workflow with id: ${args.workflowId}`
      );
    }

    const [workflowStatusConnectionRecord]: WorkflowConnectionRecord[] =
      await database
        .insert({
          workflow_id: args.workflowId,
          next_workflow_status_id: args.nextWorkflowStatusId,
          prev_workflow_status_id: args.prevWorkflowStatusId,
        })
        .into('workflow_status_connections as wc')
        .returning('*');

    if (!workflowStatusConnectionRecord) {
      throw new GraphQLError('Could not create workflow connection');
    }

    return this.createWorkflowConnectionObject(workflowStatusConnectionRecord);
  }

  async deleteWorkflowConnection(
    connectionId: number
  ): Promise<WorkflowConnection | null> {
    const deletedConnection: WorkflowConnectionRecord[] = await database(
      'workflow_connections'
    )
      .where('workflow_connection_id', connectionId)
      .del()
      .returning('*');

    if (deletedConnection.length === 0) {
      return null;
    }

    return this.createWorkflowConnectionObject(deletedConnection[0]);
  }

  async deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowStatus> {
    const removeWorkflowConnectionQuery = database('workflow_connections')
      .where('workflow_id', workflowId)
      .andWhere('status_id', statusId)
      .andWhere('sort_order', sortOrder)
      .del()
      .returning('*');

    return {} as unknown as WorkflowStatus;

    // return removeWorkflowConnectionQuery.then(
    //   (workflowStatus: WorkflowConnectionRecord[]) => {
    //     if (workflowStatus === undefined || workflowStatus.length < 1) {
    //       throw new GraphQLError(
    //         `Could not delete workflow status with id: ${workflowId} `
    //       );
    //     }

    //     // NOTE: I need this object only to be able to reorder and update other statuses in the logic layer.
    //     return this.createWorkflowConnectionObject({
    //       ...workflowStatus[0],
    //     });
    //   }
    // );
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
