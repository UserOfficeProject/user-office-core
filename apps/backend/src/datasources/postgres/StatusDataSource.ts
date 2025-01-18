import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

//TODO: Create a new file for the Status model
import { Status } from '../../models/ProposalStatus';
import { StatusDataSource } from '../StatusDataSource';
import database from './database';
import { StatusRecord } from './records';

@injectable()
export default class PostgresStatusDataSource implements StatusDataSource {
  private createStatusObject(status: StatusRecord) {
    return new Status(
      status.status_id,
      status.short_code,
      status.name,
      status.description,
      status.is_default,
      status.entity_type
    );
  }

  async createStatus(
    newStatusInput: Omit<Status, 'id' | 'is_default'>
  ): Promise<Status> {
    // TODO: To test
    const [addedStatus]: StatusRecord[] = await database
      .insert({
        short_code: newStatusInput.shortCode,
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
  async getStatus(
    statusId: number,
    entityType: Status['entityType']
  ): Promise<Status | null> {
    // TODO: To test
    const status: StatusRecord = await database
      .select()
      .from('statuses')
      .where('status_id', statusId)
      .andWhere('entity_type', entityType) // TODO: This where condition is rendundant everywhere. Check if there is a way to set it one time
      .first();

    return status ? this.createStatusObject(status) : null;
  }
  async getAllStatuses(entityType: Status['entityType']): Promise<Status[]> {
    // TODO: To test
    const statuses: StatusRecord[] = await database
      .select('*')
      .from('statuses')
      .where('entity_type', entityType)
      .orderBy('status_id', 'asc');

    return statuses.map((status) => this.createStatusObject(status));
  }
  async updateStatus(status: Status): Promise<Status> {
    // TODO: To test
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
  async deleteStatus(statusId: number): Promise<Status> {
    // TODO: To test
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
}
