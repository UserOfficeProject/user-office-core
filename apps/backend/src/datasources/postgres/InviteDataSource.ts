/* eslint-disable @typescript-eslint/naming-convention */

import { Invite } from '../../models/Invite';
import {
  GetCoProposerInvitesFilter,
  GetInvitesFilter,
  InviteDataSource,
} from '../InviteDataSource';
import database from './database';
import { createInviteObject, InviteRecord } from './records';
export default class PostgresInviteDataSource implements InviteDataSource {
  findCoProposerInvites(
    proposalPk: number,
    isClaimed?: boolean
  ): Promise<Invite[]> {
    return database
      .select('*')
      .from('co_proposer_claims')
      .where('proposal_pk', proposalPk)
      .modify((query) => {
        if (isClaimed !== undefined) {
          if (isClaimed) {
            query.whereNotNull('claimed_at');
          } else {
            query.whereNull('claimed_at');
          }
        }
      })

      .leftJoin('invites', 'co_proposer_claims.invite_id', 'invites.invite_id')
      .catch((error: Error) => {
        throw new Error(`Could not find invites: ${error.message}`);
      })
      .then((invites: InviteRecord[]) => invites.map(createInviteObject));
  }
  findVisitRegistrationInvites(
    visitId: number,
    isClaimed?: boolean
  ): Promise<Invite[]> {
    return database
      .select('invites.*')
      .from('visit_registration_claims')
      .where('visit_id', visitId)
      .modify((query) => {
        if (isClaimed !== undefined) {
          if (isClaimed) {
            query.whereNotNull('claimed_at');
          } else {
            query.whereNull('claimed_at');
          }
        }
      })
      .leftJoin(
        'invites',
        'visit_registration_claims.invite_id',
        'invites.invite_id'
      )
      .catch((error: Error) => {
        throw new Error(
          `Could not find visit registration invites: ${error.message}`
        );
      })
      .then((invites: InviteRecord[]) => invites.map(createInviteObject));
  }
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

  getInvites(filter: GetInvitesFilter): Promise<Invite[]> {
    return database
      .select('*')
      .from('invites')
      .modify((query) => {
        if (filter.createdBefore) {
          query.where('created_at', '<', filter.createdBefore);
        }

        if (filter.createdAfter) {
          query.where('created_at', '>', filter.createdAfter);
        }

        if (filter.isClaimed !== undefined) {
          if (filter.isClaimed) {
            query.whereNotNull('claimed_at');
          } else {
            query.whereNull('claimed_at');
          }
        }

        if (filter.isExpired) {
          query.where('expires_at', '<', new Date());
        }

        if (filter.email) {
          query.whereRaw('lower(email) = ?', filter.email.toLowerCase());
        }
      })
      .then((invites: InviteRecord[]) => invites.map(createInviteObject));
  }

  getCoProposerInvites(filter: GetCoProposerInvitesFilter): Promise<Invite[]> {
    return database
      .select('*')
      .from('invites')
      .join(
        'co_proposer_claims',
        'invites.invite_id',
        'co_proposer_claims.invite_id'
      )
      .modify((query) => {
        if (filter.createdBefore) {
          query.where('created_at', '<', filter.createdBefore);
        }

        if (filter.createdAfter) {
          query.where('created_at', '>', filter.createdAfter);
        }

        if (filter.isClaimed !== undefined) {
          if (filter.isClaimed) {
            query.whereNotNull('claimed_at');
          } else {
            query.whereNull('claimed_at');
          }
        }

        if (filter.isExpired) {
          query.where('expires_at', '<', new Date());
        }

        if (filter.email) {
          query.whereRaw('lower(email) = ?', filter.email.toLowerCase());
        }

        if (filter.proposalPk) {
          query.where('co_proposer_claims.proposal_pk', filter.proposalPk);
        }
      })
      .then((invites: InviteRecord[]) => invites.map(createInviteObject));
  }

  async create(args: {
    code: string;
    email: string;
    note: string;
    createdByUserId: number;
    expiresAt: Date | null;
    templateId?: string | null;
  }): Promise<Invite> {
    const { code, email, createdByUserId, expiresAt, templateId } = args;

    return database
      .insert({
        code: code,
        email: email,
        created_by: createdByUserId,
        expires_at: expiresAt,
        template_id: templateId,
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
    templateId?: string | null;
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
        template_id: args.templateId,
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
