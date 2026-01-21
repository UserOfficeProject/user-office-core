import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Status } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';
import { WorkflowStatus } from '../../models/WorkflowStatus';
import { UpdateStatusInput } from '../../resolvers/mutations/settings/UpdateStatusMutation';
import { StatusDataSource } from '../StatusDataSource';
import database from './database';
import { StatusRecord, WorkflowStatusRecord } from './records';

@injectable()
export default class PostgresStatusDataSource implements StatusDataSource {
  private createStatusObject(status: StatusRecord) {
    return new Status(
      status.status_id,
      status.name,
      status.description,
      status.is_default,
      status.entity_type
    );
  }

  private createWorkflowStatusObject = (
    workflowStatus: WorkflowStatusRecord
  ) => {
    return new WorkflowStatus(
      workflowStatus.workflow_status_id,
      workflowStatus.workflow_id,
      workflowStatus.status_id,
      workflowStatus.pos_x,
      workflowStatus.pos_y
    );
  };

  async createStatus(
    newStatusInput: Omit<Status, 'is_default'>
  ): Promise<Status> {
    const [addedStatus]: StatusRecord[] = await database
      .insert({
        id: newStatusInput.id,
        name: newStatusInput.name,
        description: newStatusInput.description,
        entity_type: newStatusInput.entityType,
      })
      .into('statuses')
      .returning(['*']);

    if (!addedStatus) {
      throw new GraphQLError('Could not create status');
    }

    return this.createStatusObject(addedStatus);
  }

  async getStatus(statusId: string): Promise<Status | null> {
    const status: StatusRecord = await database
      .select()
      .from('statuses')
      .where('status_id', statusId)
      .first();

    return status ? this.createStatusObject(status) : null;
  }

  async getWorkflowStatus(
    workflowStatusId: number
  ): Promise<WorkflowStatus | null> {
    const workflowStatus: WorkflowStatusRecord = await database
      .select()
      .from('workflow_has_statuses')
      .where('workflow_status_id', workflowStatusId)
      .first();

    if (!workflowStatus) {
      return null;
    }

    return this.createWorkflowStatusObject(workflowStatus);
  }

  async getAllStatuses(entityType: Status['entityType']): Promise<Status[]> {
    const statuses: StatusRecord[] = await database
      .select('*')
      .from('statuses')
      .where('entity_type', entityType)
      .orderBy('status_id', 'asc');

    return statuses.map((status) => this.createStatusObject(status));
  }

  async getAllWorkflowStatuses(workflowId: number): Promise<WorkflowStatus[]> {
    const workflowStatuses: WorkflowStatusRecord[] = await database
      .select()
      .from('workflow_has_statuses')
      .where('workflow_id', workflowId)
      .orderBy('workflow_status_id', 'asc');

    return workflowStatuses.map(this.createWorkflowStatusObject);
  }

  async updateStatus(status: UpdateStatusInput): Promise<Status> {
    const [updatedStatus]: StatusRecord[] = await database
      .update(
        {
          name: status.name,
          description: status.description,
        },
        ['*']
      )
      .from('statuses')
      .where('status_id', status.id);

    if (!updatedStatus) {
      throw new GraphQLError(`Status not found ${status.id}`);
    }

    return this.createStatusObject(updatedStatus);
  }

  async deleteStatus(statusId: string): Promise<Status> {
    const [removedStatus]: StatusRecord[] = await database('statuses')
      .where('status_id', statusId)
      .andWhere('is_default', false)
      .del()
      .returning('*');

    if (!removedStatus) {
      throw new GraphQLError(`Could not delete status with id: ${statusId} `);
    }

    return this.createStatusObject(removedStatus);
  }

  async getDefaultStatus(
    entityType: Status['entityType']
  ): Promise<Status | null> {
    const status: StatusRecord = await database
      .select()
      .from('statuses')
      .where('entity_type', entityType)
      .andWhere('is_default', true)
      .first();

    return status ? this.createStatusObject(status) : null;
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

    const defaultStatus = await this.getDefaultStatus(workflow.entity_type);

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

  async getInitialStatus(
    entityType: Status['entityType']
  ): Promise<Status | null> {
    const statusId =
      entityType === WorkflowType.PROPOSAL ? 'DRAFT' : 'AWAITING_ESF';

    const status: StatusRecord = await database
      .select()
      .from('statuses')
      .where('entity_type', entityType)
      .andWhere('status_id', statusId)
      .first();

    return status ? this.createStatusObject(status) : null;
  }
}
