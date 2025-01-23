import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

//TODO: Create a new file for the Status model
import { Status } from '../../models/ProposalStatus';
import { Workflow } from '../../models/ProposalWorkflow';
import {
  WorkflowConnection,
  NextAndPreviousStatuses,
  WorkflowConnectionWithStatus,
} from '../../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
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
      workflowConnection.droppable_group_id,
      workflowConnection.parent_droppable_group_id,
      workflowConnection.entity_type
    );
  }
  async createWorkflow(
    newWorkflowInput: Omit<Workflow, 'id'>
  ): Promise<Workflow> {
    // TODO: To test
    const [workflowRecord]: WorkflowRecord[] = await database
      .insert({
        name: newWorkflowInput.name,
        description: newWorkflowInput.description,
        entity_type: newWorkflowInput.entityType,
      })
      .into('workflows')
      .returning('*');

    if (!workflowRecord) {
      throw new GraphQLError('Could not create proposal status');
    }

    // NOTE: Add default DRAFT status to proposal workflow when it is created.
    await this.addWorkflowStatus({
      sortOrder: 0,
      droppableGroupId: 'proposalWorkflowConnections_0', //TODO: This needs to be generalised for proposal and experiment
      nextStatusId: null,
      prevStatusId: null,
      parentDroppableGroupId: null,
      statusId: 1, //TODO: Implement Eum
      workflowId: workflowRecord.workflow_id,
      entityType: workflowRecord.entity_type,
    });

    return this.createWorkflowObject(workflowRecord);
  }
  async getWorkflow(
    workflowId: number,
    entityType: Workflow['entityType']
  ): Promise<Workflow | null> {
    // TODO: To test
    return database
      .select()
      .from('workflows')
      .where('workflow_id', workflowId)
      .andWhere('entity_type', entityType)
      .first()
      .then((proposalWorkflow: WorkflowRecord | null) =>
        proposalWorkflow ? this.createWorkflowObject(proposalWorkflow) : null
      );
  }
  async getAllWorkflows(
    entityType: Workflow['entityType']
  ): Promise<Workflow[]> {
    // TODO: To test
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
    // TODO: To test
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
    // TODO: To test
    return database('workflows')
      .where('workflow_id', workflowId)
      .andWhere('entity_type', 'proposal')
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
    workflowId: WorkflowConnection['workflowId'],
    entityType: WorkflowConnection['entityType'],
    droppableGroupId?: WorkflowConnection['droppableGroupId'],
    byParentGroupId?: boolean | undefined
  ): Promise<WorkflowConnectionWithStatus[]> {
    // TODO: To test
    const andConditionIfDroppableGroupIdDefined = `AND droppable_group_id = '${droppableGroupId}'`;
    const andConditionIfParentDroppableGroupIdDefined =
      byParentGroupId &&
      !!droppableGroupId &&
      `AND parent_droppable_group_id = '${droppableGroupId}'`;
    const andWhereCondition =
      !byParentGroupId && !!droppableGroupId
        ? andConditionIfDroppableGroupIdDefined
        : byParentGroupId && !!droppableGroupId
          ? andConditionIfParentDroppableGroupIdDefined
          : '';

    const getUniqueOrderedProposalWorkflowConnectionsQuery = `
      SELECT * FROM (
        SELECT DISTINCT ON (wc.status_id, wc.sort_order, wc.droppable_group_id) *
        FROM workflow_connections as wc
        LEFT JOIN
          statuses as s
        ON
          s.status_id = wc.status_id
        WHERE workflow_id = ${workflowId}
        AND s.entity_type = '${entityType}'
        AND wc.entity_type = '${entityType}'
        ${andWhereCondition}
      ) t
      ORDER BY
        droppable_group_id ASC,
        sort_order ASC
    `;

    const workflowConnections:
      | (WorkflowConnectionRecord & StatusRecord)[]
      | null = (
      await database.raw(getUniqueOrderedProposalWorkflowConnectionsQuery)
    ).rows;

    return workflowConnections
      ? workflowConnections.map((workflowConnection) =>
          this.createWorkflowConnectionObject(workflowConnection)
        )
      : [];
  }
  async getWorkflowConnectionsById(
    workflowId: WorkflowConnection['workflowId'],
    statusId: Status['id'],
    entityType: WorkflowConnection['entityType'],
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]> {
    // TODO: To test
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

    const proposalWorkflowConnections = workflowConnectionRecords.map(
      (proposalWorkflowConnectionRecord) =>
        this.createWorkflowConnectionObject(proposalWorkflowConnectionRecord)
    );

    return proposalWorkflowConnections;
  }
  async addWorkflowStatus(
    newWorkflowStatusInput: Omit<WorkflowConnection, 'id'>
  ): Promise<WorkflowConnectionWithStatus> {
    // TODO: To test
    const [workflowConnectionRecord]: (WorkflowConnectionRecord &
      StatusRecord)[] = await database
      .insert({
        workflow_id: newWorkflowStatusInput.workflowId,
        status_id: newWorkflowStatusInput.statusId,
        next_status_id: newWorkflowStatusInput.nextStatusId,
        prev_status_id: newWorkflowStatusInput.prevStatusId,
        sort_order: newWorkflowStatusInput.sortOrder,
        droppable_group_id: newWorkflowStatusInput.droppableGroupId,
        parent_droppable_group_id:
          newWorkflowStatusInput.parentDroppableGroupId,
        entity_type: 'proposal',
      })
      .into('workflow_connections as wc')
      .returning('*')
      .join('statuses as s', {
        's.status_id': newWorkflowStatusInput.statusId,
      });
    if (!workflowConnectionRecord) {
      throw new GraphQLError('Could not create proposal workflow status');
    }

    return this.createWorkflowConnectionObject(workflowConnectionRecord);
  }

  async upsertProposalWorkflowStatuses(connections: WorkflowConnection[]) {
    const dataToInsert = connections.map((connection) => ({
      workflow_connection_id: connection.id,
      workflow_id: connection.workflowId,
      status_id: connection.statusId,
      next_status_id: connection.nextStatusId,
      prev_status_id: connection.prevStatusId,
      sort_order: connection.sortOrder,
      droppable_group_id: connection.droppableGroupId,
      parent_droppable_group_id: connection.parentDroppableGroupId,
      entity_type: connection.entityType,
    }));

    const result = await database.raw(
      `? ON CONFLICT (workflow_connection_id)
                  DO UPDATE SET
                  status_id = EXCLUDED.status_id,
                  next_status_id = EXCLUDED.next_status_id,
                  prev_status_id = EXCLUDED.prev_status_id,
                  sort_order = EXCLUDED.sort_order,
                  droppable_group_id = EXCLUDED.droppable_group_id,
                  parent_droppable_group_id = EXCLUDED.parent_droppable_group_id
                RETURNING *;`,
      [database('workflow_connections').insert(dataToInsert)]
    );

    return result.rows as WorkflowConnectionRecord[];
  }

  async updateWorkflowStatuses(
    workflowStatuses: WorkflowConnection[]
  ): Promise<WorkflowConnectionWithStatus[]> {
    // TODO: To test
    const connectionsResult =
      await this.upsertProposalWorkflowStatuses(workflowStatuses);
    if (connectionsResult) {
      // NOTE: Return result as ProposalWorkflowConnection[] but do not care about name and description.
      return connectionsResult.map((connection) =>
        this.createWorkflowConnectionObject({
          ...connection,
          short_code: '',
          name: '',
          description: '',
          is_default: true,
          full_count: connectionsResult.length,
        })
      );
    } else {
      return [];
    }
  }
  async deleteWorkflowStatus(
    statusId: number,
    workflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnectionWithStatus> {
    // TODO: To test
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
          short_code: '',
          name: '',
          description: '',
          is_default: true,
          full_count: 1,
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
      statusChangingEvent.status_changing_event,
      statusChangingEvent.entity_type
    );
  }

  async addStatusChangingEventsToConnection(
    workflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    // TODO: To test

    const eventsToInsert = statusChangingEvents.map((statusChangingEvent) => ({
      workflow_connection_id: workflowConnectionId,
      status_changing_event: statusChangingEvent,
      entity_type: 'proposal', //TODO: This needs to be generalised for proposal and experiment. Fetch the Entity type from the workflow connection and use it
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
    workflowConnectionIds: number[],
    entityType: StatusChangingEvent['entityType']
  ): Promise<StatusChangingEvent[]> {
    // TODO: To test
    return database
      .select('*')
      .from('status_changing_events')
      .whereIn('workflow_connection_id', workflowConnectionIds)
      .andWhere('entity_type', entityType)
      .then((statusChangingEvents: StatusChangingEventRecord[]) => {
        return statusChangingEvents.map((statusChangingEvent) =>
          this.createStatusChangingEventObject(statusChangingEvent)
        );
      });
  }
}
