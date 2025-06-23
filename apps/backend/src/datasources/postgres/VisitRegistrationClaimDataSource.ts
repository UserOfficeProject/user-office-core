import { injectable } from 'tsyringe';

import { VisitRegistrationClaim } from '../../models/VisitRegistrationClaim';
import { VisitRegistrationClaimDataSource } from '../VisitRegistrationClaimDataSource';
import database from './database';
import {
  VisitRegistrationClaimRecord,
  createVisitRegistrationClaimObject,
} from './records';

@injectable()
export default class PostgresVisitRegistrationClaimDataSource
  implements VisitRegistrationClaimDataSource
{
  async create(
    inviteId: number,
    visitId: number
  ): Promise<VisitRegistrationClaim> {
    const records = await database('visit_registration_claims')
      .insert(
        {
          invite_id: inviteId,
          visit_id: visitId,
        },
        '*'
      )
      .onConflict(['invite_id', 'visit_id'])
      .ignore();

    if (records.length !== 1) {
      throw new Error('Failed to create visit registration claim');
    }

    return createVisitRegistrationClaimObject(
      records[0] as VisitRegistrationClaimRecord
    );
  }

  async findByInviteId(inviteId: number): Promise<VisitRegistrationClaim[]> {
    const records = await database<VisitRegistrationClaimRecord>(
      'visit_registration_claims'
    )
      .select('*')
      .where('invite_id', inviteId);

    return records.map((record: VisitRegistrationClaimRecord) =>
      createVisitRegistrationClaimObject(record)
    );
  }

  async findByVisitId(visitId: number): Promise<VisitRegistrationClaim[]> {
    const records = await database('visit_registration_claims')
      .select('*')
      .where('visit_id', visitId);

    return records.map((record: VisitRegistrationClaimRecord) =>
      createVisitRegistrationClaimObject(record)
    );
  }
}
