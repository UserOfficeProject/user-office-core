/* eslint-disable @typescript-eslint/naming-convention */

import { Invite } from '../../models/Invite';
import { UpdateInviteInput } from '../../resolvers/mutations/UpdateInviteMutation';
import { InviteDataSource } from '../InviteDataSource';
import database from './database';
import { createInviteObject, InviteRecord } from './records';

export default class PostgresInviteDataSource implements InviteDataSource {
  findByCode(code: string): Promise<Invite | null> {
    return database
      .select('*')
      .from('invites')
      .where('code', code)
      .catch((error: Error) => {
        throw new Error(`Could not find invite: ${error.message}`);
      })
      .then((invites: InviteRecord[]) => {
        if (invites.length === 0) {
          return null;
        }

        return createInviteObject(invites[0]);
      });
  }

  async create(
    createdByUserId: number,
    code: string,
    email: string
  ): Promise<Invite> {
    return database
      .insert({
        code: code,
        email: email,
        created_by: createdByUserId,
      })
      .into('invites')
      .returning('*')
      .catch((error: Error) => {
        throw new Error(`Could not create invite: ${error.message}`);
      })
      .then((invites: InviteRecord[]) => createInviteObject(invites[0]));
  }

  async update(
    args: UpdateInviteInput & Pick<Invite, 'claimedAt' | 'claimedByUserId'>
  ): Promise<Invite> {
    return database
      .update({
        code: args.code,
        email: args.email,
        note: args.note,
        claimed_at: args.claimedAt,
        claimed_by: args.claimedByUserId,
      })
      .from('invites')
      .where('invite_id', args.id)
      .returning('*')
      .then((invites: InviteRecord[]) => createInviteObject(invites[0]));
  }

  async findById(id: number): Promise<Invite | null> {
    return database
      .select('*')
      .from('invites')
      .where('invite_id', id)
      .catch((error: Error) => {
        throw new Error(`Could not find invite: ${error.message}`);
      })
      .then((invites: InviteRecord[]) => {
        if (invites.length === 0) {
          return null;
        }

        return createInviteObject(invites[0]);
      });
  }

  async delete(id: number): Promise<void> {
    await database('invites')
      .where('invite_id', id)
      .delete()
      .catch((error: Error) => {
        throw new Error(`Could not delete invite: ${error.message}`);
      });
  }
}
