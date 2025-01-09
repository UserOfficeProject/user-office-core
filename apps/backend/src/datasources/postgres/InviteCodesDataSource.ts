/* eslint-disable @typescript-eslint/naming-convention */

import { InviteCode } from '../../models/InviteCode';
import { UpdateInviteInput } from '../../resolvers/mutations/UpdateInviteMutation';
import { InviteCodeDataSource } from '../InviteCodeDataSource';
import database from './database';
import { createInviteCodeObject, InviteCodeRecord } from './records';

export default class PostgresInviteCodesDataSource
  implements InviteCodeDataSource
{
  findByCode(code: string): Promise<InviteCode | null> {
    return database
      .select('*')
      .from('invite_codes')
      .where('code', code)
      .catch((error: Error) => {
        throw new Error(`Could not find invite: ${error.message}`);
      })
      .then((invites: InviteCodeRecord[]) => {
        if (invites.length === 0) {
          return null;
        }

        return createInviteCodeObject(invites[0]);
      });
  }

  async create(
    createdByUserId: number,
    code: string,
    email: string
  ): Promise<InviteCode> {
    return database
      .insert({
        code: code,
        email: email,
        created_by: createdByUserId,
      })
      .into('invite_codes')
      .returning('*')
      .catch((error: Error) => {
        throw new Error(`Could not create invite: ${error.message}`);
      })
      .then((invites: InviteCodeRecord[]) =>
        createInviteCodeObject(invites[0])
      );
  }

  async update(
    args: UpdateInviteInput & Pick<InviteCode, 'claimedAt' | 'claimedByUserId'>
  ): Promise<InviteCode> {
    return database
      .update({
        code: args.code,
        email: args.email,
        note: args.note,
        claimed_at: args.claimedAt,
        claimed_by: args.claimedByUserId,
      })
      .from('invite_codes')
      .where('invite_code_id', args.id)
      .returning('*')
      .then((invites: InviteCodeRecord[]) =>
        createInviteCodeObject(invites[0])
      );
  }

  async findById(id: number): Promise<InviteCode | null> {
    return database
      .select('*')
      .from('invite_codes')
      .where('invite_code_id', id)
      .catch((error: Error) => {
        throw new Error(`Could not find invite: ${error.message}`);
      })
      .then((invites: InviteCodeRecord[]) => {
        if (invites.length === 0) {
          return null;
        }

        return createInviteCodeObject(invites[0]);
      });
  }
}
