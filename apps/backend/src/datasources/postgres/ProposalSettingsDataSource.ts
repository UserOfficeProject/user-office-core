import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow, Workflow } from '../../models/ProposalWorkflow';
import {
  NextAndPreviousProposalStatuses,
  ProposalWorkflowConnection,
  WorkflowConnection,
} from '../../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { AddProposalWorkflowStatusInput } from '../../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
import database from './database';
import {
  StatusChangingEventRecord,
  ProposalStatusRecord,
  ProposalWorkflowConnectionRecord,
  ProposalWorkflowRecord,
  WorkflowRecord,
  WorkflowConnectionRecord,
  StatusRecord,
} from './records';

@injectable()
export default class PostgresProposalSettingsDataSource
  implements ProposalSettingsDataSource
{
  // ----------- Proposal statuses ---------->
  private createProposalStatusObject(proposalStatus: ProposalStatusRecord) {
    return new ProposalStatus(
      proposalStatus.status_id,
      proposalStatus.short_code,
      proposalStatus.name,
      proposalStatus.description,
      proposalStatus.is_default
    );
  }

  async createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus> {
    const [addedProposalStatus]: ProposalStatusRecord[] = await database
      .insert({
        short_code: newProposalStatusInput.shortCode,
        name: newProposalStatusInput.name,
        description: newProposalStatusInput.description,
        entity_type: newProposalStatusInput.entityType,
      })
      .into('statuses')
      .returning(['*']);

    if (!addedProposalStatus) {
      throw new GraphQLError('Could not create proposal status');
    }

    return this.createProposalStatusObject(addedProposalStatus);
  }

  async getProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus | null> {
    const proposalStatus: ProposalStatusRecord = await database
      .select()
      .from('statuses')
      .where('status_id', proposalStatusId)
      .andWhere('entity_type', 'proposal')
      .first();

    return proposalStatus
      ? this.createProposalStatusObject(proposalStatus)
      : null;
  }

  async getAllProposalStatuses(): Promise<ProposalStatus[]> {
    const proposalStatuses: ProposalStatusRecord[] = await database
      .select('*')
      .from('statuses')
      .where('entity_type', 'proposal')
      .orderBy('status_id', 'asc');

    return proposalStatuses.map((proposalStatus) =>
      this.createProposalStatusObject(proposalStatus)
    );
  }

  async updateProposalStatus(
    proposalStatus: ProposalStatus
  ): Promise<ProposalStatus> {
    const [updatedProposalStatus]: ProposalStatusRecord[] = await database
      .update(
        {
          name: proposalStatus.name,
          description: proposalStatus.description,
        },
        ['*']
      )
      .from('statuses')
      .where('status_id', proposalStatus.id)
      .andWhere('entity_type', 'proposal');

    if (!updatedProposalStatus) {
      throw new GraphQLError(`ProposalStatus not found ${proposalStatus.id}`);
    }

    return this.createProposalStatusObject(updatedProposalStatus);
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    const [removedProposalStatus]: ProposalStatusRecord[] = await database(
      'statuses'
    )
      .where('status_id', proposalStatusId)
      .andWhere('is_default', false)
      .andWhere('entity_type', 'proposal')
      .del()
      .returning('*');

    if (!removedProposalStatus) {
      throw new GraphQLError(
        `Could not delete proposalStatus with id: ${proposalStatusId} `
      );
    }

    return this.createProposalStatusObject(removedProposalStatus);
  }
  // <---------- Proposal statuses ------`-----

  // ----------- Proposal workflows ---------->
  private createProposalWorkflowObject(proposalWorkflow: WorkflowRecord) {
    return new Workflow(
      proposalWorkflow.workflow_id,
      proposalWorkflow.name,
      proposalWorkflow.description,
      proposalWorkflow.entity_type
    );
  }

  private createWorkflowObject(workflow: WorkflowRecord) {
    return new Workflow(
      workflow.workflow_id,
      workflow.name,
      workflow.description,
      workflow.entity_type
    );
  }

  async createProposalWorkflow(
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow> {
    const [proposalWorkflowRecord]: ProposalWorkflowRecord[] = await database
      .insert({ ...args, entity_type: 'proposal' })
      .into('workflows')
      .returning('*');

    if (!proposalWorkflowRecord) {
      throw new GraphQLError('Could not create proposal status');
    }

    // NOTE: Add default DRAFT status to proposal workflow when it is created.
    await this.addProposalWorkflowStatus({
      sortOrder: 0,
      droppableGroupId: 'proposalWorkflowConnections_0',
      nextStatusId: null,
      prevStatusId: null,
      parentDroppableGroupId: null,
      proposalStatusId: 1,
      proposalWorkflowId: proposalWorkflowRecord.workflow_id,
    });

    return this.createProposalWorkflowObject(proposalWorkflowRecord);
  }

  async getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null> {
    return database
      .select()
      .from('workflows')
      .where('workflow_id', proposalWorkflowId)
      .andWhere('entity_type', 'proposal')
      .first()
      .then((proposalWorkflow: ProposalWorkflowRecord | null) =>
        proposalWorkflow
          ? this.createProposalWorkflowObject(proposalWorkflow)
          : null
      );
  }

  //TODO: Where to put this?
  async getProposalWorkflowByCall(
    callId: number
  ): Promise<ProposalWorkflow | null> {
    return database
      .select()
      .from('call as c')
      .join('workflows as w', {
        'w.workflow_id': 'c.proposal_workflow_id',
      })
      .where('c.call_id', callId)
      .andWhere('w.entity_type', 'proposal')
      .first()
      .then((proposalWorkflow: ProposalWorkflowRecord | null) =>
        proposalWorkflow
          ? this.createProposalWorkflowObject(proposalWorkflow)
          : null
      );
  }

  async getAllWorkflows(
    entityType: 'proposal' | 'experiment'
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

  async updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow> {
    return database
      .update(
        {
          workflow_id: proposalWorkflow.id,
          name: proposalWorkflow.name,
          description: proposalWorkflow.description,
        },
        ['*']
      )
      .from('workflows')
      .where('workflow_id', proposalWorkflow.id)
      .andWhere('entity_type', 'proposal')
      .then((records: ProposalWorkflowRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(
            `Proposal workflow not found ${proposalWorkflow.id}`
          );
        }

        return this.createProposalWorkflowObject(records[0]);
      });
  }

  async deleteProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow> {
    return database('workflows')
      .where('workflow_id', proposalWorkflowId)
      .andWhere('entity_type', 'proposal')
      .del()
      .returning('*')
      .then((proposalWorkflow: ProposalWorkflowRecord[]) => {
        if (proposalWorkflow === undefined || proposalWorkflow.length !== 1) {
          throw new GraphQLError(
            `Could not delete proposal workflow with id: ${proposalWorkflowId} `
          );
        }

        return this.createProposalWorkflowObject(proposalWorkflow[0]);
      });
  }
  // <---------- Proposal workflows -----------

  private createProposalWorkflowConnectionObject(
    proposalWorkflowConnection: ProposalWorkflowConnectionRecord &
      ProposalStatusRecord
  ) {
    return new ProposalWorkflowConnection(
      proposalWorkflowConnection.workflow_connection_id,
      proposalWorkflowConnection.sort_order,
      proposalWorkflowConnection.workflow_id,
      proposalWorkflowConnection.status_id,
      {
        id: proposalWorkflowConnection.status_id,
        shortCode: proposalWorkflowConnection.short_code,
        name: proposalWorkflowConnection.name,
        description: proposalWorkflowConnection.description,
        isDefault: proposalWorkflowConnection.is_default,
      },
      proposalWorkflowConnection.next_status_id,
      proposalWorkflowConnection.prev_status_id,
      proposalWorkflowConnection.droppable_group_id,
      proposalWorkflowConnection.parent_droppable_group_id
    );
  }

  private createWorkflowConnectionObject(
    workflowConnection: WorkflowConnectionRecord & StatusRecord
  ) {
    return new WorkflowConnection(
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
      },
      workflowConnection.next_status_id,
      workflowConnection.prev_status_id,
      workflowConnection.droppable_group_id,
      workflowConnection.parent_droppable_group_id,
      workflowConnection.entity_type
    );
  }

  async getProposalWorkflowConnections(
    proposalWorkflowId: number,
    droppableGroupId: string | undefined = undefined,
    byParentGroupId: boolean | undefined = false
  ): Promise<ProposalWorkflowConnection[]> {
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
        WHERE workflow_id = ${proposalWorkflowId}
        ${andWhereCondition}
      ) t
      ORDER BY
        droppable_group_id ASC,
        sort_order ASC
    `;

    const proposalWorkflowConnections:
      | (ProposalWorkflowConnectionRecord & ProposalStatusRecord)[]
      | null = (
      await database.raw(getUniqueOrderedProposalWorkflowConnectionsQuery)
    ).rows;

    return proposalWorkflowConnections
      ? proposalWorkflowConnections.map((proposalWorkflowConnection) =>
          this.createProposalWorkflowConnectionObject(
            proposalWorkflowConnection
          )
        )
      : [];
  }

  async getWorkflowConnections(
    workflowId: number,
    entityType: 'proposal' | 'experiment',
    droppableGroupId: string | undefined = undefined,
    byParentGroupId: boolean | undefined = false
  ): Promise<WorkflowConnection[]> {
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
        AND wc.entity_type = '${entityType}'
        AND s.entity_type = '${entityType}'
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

  async getProposalWorkflowConnectionsById(
    proposalWorkflowId: number,
    proposalStatusId: number,
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousProposalStatuses
  ): Promise<ProposalWorkflowConnection[]> {
    const proposalWorkflowConnectionRecords: (ProposalWorkflowConnectionRecord &
      ProposalStatusRecord)[] = await database
      .select()
      .from('workflow_connections as wc')
      .join('statuses as s', {
        's.status_id': 'wc.status_id',
      })
      .where('workflow_id', proposalWorkflowId)
      .andWhere('wc.status_id', proposalStatusId)
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

    if (!proposalWorkflowConnectionRecords) {
      throw new GraphQLError(
        `Could not find proposal workflow connections with proposalStatusId: ${proposalStatusId}`
      );
    }

    const proposalWorkflowConnections = proposalWorkflowConnectionRecords.map(
      (proposalWorkflowConnectionRecord) =>
        this.createProposalWorkflowConnectionObject(
          proposalWorkflowConnectionRecord
        )
    );

    return proposalWorkflowConnections;
  }

  async addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection> {
    const [
      proposalWorkflowConnectionRecord,
    ]: (ProposalWorkflowConnectionRecord & ProposalStatusRecord)[] =
      await database
        .insert({
          workflow_id: newProposalWorkflowStatusInput.proposalWorkflowId,
          status_id: newProposalWorkflowStatusInput.proposalStatusId,
          next_status_id: newProposalWorkflowStatusInput.nextStatusId,
          prev_status_id: newProposalWorkflowStatusInput.prevStatusId,
          sort_order: newProposalWorkflowStatusInput.sortOrder,
          droppable_group_id: newProposalWorkflowStatusInput.droppableGroupId,
          parent_droppable_group_id:
            newProposalWorkflowStatusInput.parentDroppableGroupId,
          entity_type: 'proposal',
        })
        .into('workflow_connections as wc')
        .returning('*')
        .join('statuses as s', {
          's.status_id': newProposalWorkflowStatusInput.proposalStatusId,
        });

    if (!proposalWorkflowConnectionRecord) {
      throw new GraphQLError('Could not create proposal workflow status');
    }

    return this.createProposalWorkflowConnectionObject(
      proposalWorkflowConnectionRecord
    );
  }

  async upsertProposalWorkflowStatuses(
    collection: ProposalWorkflowConnection[]
  ) {
    const dataToInsert = collection.map((item) => ({
      workflow_connection_id: item.id,
      workflow_id: item.workflowId,
      status_id: item.statusId,
      next_status_id: item.nextStatusId,
      prev_status_id: item.prevStatusId,
      sort_order: item.sortOrder,
      droppable_group_id: item.droppableGroupId,
      parent_droppable_group_id: item.parentDroppableGroupId,
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

    return result.rows as ProposalWorkflowConnectionRecord[];
  }

  async updateProposalWorkflowStatuses(
    proposalWorkflowStatusesInput: ProposalWorkflowConnection[]
  ): Promise<ProposalWorkflowConnection[]> {
    const connectionsResult = await this.upsertProposalWorkflowStatuses(
      proposalWorkflowStatusesInput
    );

    if (connectionsResult) {
      // NOTE: Return result as ProposalWorkflowConnection[] but do not care about name and description.
      return connectionsResult.map((connection) =>
        this.createProposalWorkflowConnectionObject({
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

  async deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number,
    sortOrder: number
  ): Promise<ProposalWorkflowConnection> {
    const removeWorkflowConnectionQuery = database('workflow_connections')
      .where('workflow_id', proposalWorkflowId)
      .andWhere('status_id', proposalStatusId)
      .andWhere('entity_type', 'proposal')
      .andWhere('sort_order', sortOrder)
      .del()
      .returning('*');

    return removeWorkflowConnectionQuery.then(
      (proposalWorkflowStatus: ProposalWorkflowConnectionRecord[]) => {
        if (
          proposalWorkflowStatus === undefined ||
          proposalWorkflowStatus.length < 1
        ) {
          throw new GraphQLError(
            `Could not delete proposal workflow status with id: ${proposalWorkflowId} `
          );
        }

        // NOTE: I need this object only to be able to reorder and update other statuses in the logic layer.
        return this.createProposalWorkflowConnectionObject({
          ...proposalWorkflowStatus[0],
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
      statusChangingEvent.status_changing_event
    );
  }

  async addStatusChangingEventsToConnection(
    proposalWorkflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    const eventsToInsert = statusChangingEvents.map((statusChangingEvent) => ({
      workflow_connection_id: proposalWorkflowConnectionId,
      status_changing_event: statusChangingEvent,
      entity_type: 'proposal',
    }));

    await database('status_changing_events')
      .where('workflow_connection_id', proposalWorkflowConnectionId)
      .andWhere('entity_type', 'proposal')
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
    proposalWorkflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return database
      .select('*')
      .from('status_changing_events')
      .whereIn('workflow_connection_id', proposalWorkflowConnectionIds)
      .andWhere('entity_type', 'proposal')
      .then((statusChangingEvents: StatusChangingEventRecord[]) => {
        return statusChangingEvents.map((statusChangingEvent) =>
          this.createStatusChangingEventObject(statusChangingEvent)
        );
      });
  }
}
