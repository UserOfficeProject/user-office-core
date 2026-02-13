import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Status } from '../../models/Status';
import { WorkflowType } from '../../models/Workflow';
import { UpdateStatusInput } from '../../resolvers/mutations/settings/UpdateStatusMutation';
import { StatusDataSource } from '../StatusDataSource';
import database from './database';
import { StatusRecord } from './records';

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

  async createStatus(
    newStatusInput: Omit<Status, 'is_default'>
  ): Promise<Status> {
    const [addedStatus]: StatusRecord[] = await database
      .insert({
        status_id: newStatusInput.id,
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

  async getAllStatuses(entityType: Status['entityType']): Promise<Status[]> {
    const statuses: StatusRecord[] = await database
      .select('*')
      .from('statuses')
      .where('entity_type', entityType)
      .orderBy('status_id', 'asc');

    return statuses.map((status) => this.createStatusObject(status));
  }

  async updateStatus(status: UpdateStatusInput): Promise<Status> {
    const [updatedStatus]: StatusRecord[] = await database
      .update(
        {
          status_id: status.id,
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
