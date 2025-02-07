/* eslint-disable @typescript-eslint/naming-convention */

import { Invite } from '../../models/Invite';
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

  async create(args: {
    code: string;
    email: string;
    note: string;
    createdByUserId: number;
    expiresAt: Date | null;
  }): Promise<Invite> {
    const { code, email, createdByUserId, expiresAt } = args;

    return database
      .insert({
        code: code,
        email: email,
        created_by: createdByUserId,
        expires_at: expiresAt,
      })
      .into('invites')
      .returning('*')
      .catch((error: Error) => {
        throw new Error(`Could not create invite: ${error.message}`);
      })
      .then((invites: InviteRecord[]) => createInviteObject(invites[0]));
  }

  async update(args: {
    id: number;
    code?: string;
    email?: string;
    note?: string;
    claimedAt?: Date | null;
    claimedByUserId?: number | null;
    isEmailSent?: boolean;
    expiresAt?: Date | null;
  }): Promise<Invite> {
    return database
      .update({
        code: args.code,
        email: args.email,
        note: args.note,
        claimed_at: args.claimedAt,
        claimed_by: args.claimedByUserId,
        is_email_sent: args.isEmailSent,
        expires_at: args.expiresAt,
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
