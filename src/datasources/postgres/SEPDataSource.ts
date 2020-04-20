/* eslint-disable @typescript-eslint/camelcase */
import { SEP, SEPAssignment } from '../../models/SEP';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import { SEPRecord, SEPAssignmentRecord } from './records';

export default class PostgresSEPDataSource implements SEPDataSource {
  private createSEPObject(sep: SEPRecord) {
    return new SEP(
      sep.sep_id,
      sep.code,
      sep.description,
      sep.number_ratings_required,
      sep.active
    );
  }

  private createSEPAssignmentObject(sepAssignment: SEPAssignmentRecord) {
    return new SEPAssignment(
      sepAssignment.proposal_id,
      sepAssignment.sep_member_user_id,
      sepAssignment.sep_id,
      sepAssignment.date_assigned,
      sepAssignment.reassigned,
      sepAssignment.date_reassigned,
      sepAssignment.email_sent
    );
  }

  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return database
      .insert(
        {
          code: code,
          description: description,
          number_ratings_required: numberRatingsRequired,
          active: active,
        },
        ['*']
      )
      .from('SEPs')
      .then((resultSet: SEPRecord[]) => this.createSEPObject(resultSet[0]));
  }

  async update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return database
      .update(
        {
          code,
          description,
          number_ratings_required: numberRatingsRequired,
          active,
        },
        ['*']
      )
      .from('SEPs')
      .where('sep_id', id)
      .then((records: SEPRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`SEP not found ${id}`);
        }

        return this.createSEPObject(records[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from('SEPs')
      .where('sep_id', id)
      .first()
      .then((sep: SEPRecord) => {
        return sep ? this.createSEPObject(sep) : null;
      });
  }

  async getAll(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('SEPs')
      .orderBy('sep_id', 'desc')
      .modify(query => {
        if (filter) {
          query
            .where('code', 'ilike', `%${filter}%`)
            .orWhere('description', 'ilike', `%${filter}%`);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((allSeps: SEPRecord[]) => {
        const seps = allSeps.map(sep => this.createSEPObject(sep));

        return {
          totalCount: allSeps[0] ? allSeps[0].full_count : 0,
          seps,
        };
      });
  }

  async getAssignments(sepId: number): Promise<SEPAssignment[]> {
    const sepAssignments: SEPAssignmentRecord[] = await database
      .from('SEP_Assignments')
      .where('sep_id', sepId);

    return sepAssignments.map(sepAssignment =>
      this.createSEPAssignmentObject(sepAssignment)
    );
  }

  async assignMembers(memberIds: number[], sepId: number): Promise<boolean> {
    const dataToInsert = memberIds.map(memberId => {
      return { sep_member_user_id: memberId, sep_id: sepId };
    });

    await database.insert(dataToInsert).from('SEP_Assignments');

    return true;
  }
}
