/* eslint-disable @typescript-eslint/camelcase */
import {
  Instrument,
  InstrumentWithAvailabilityTime,
} from '../../models/Instrument';
import { ProposalIds } from '../../models/Proposal';
import { BasicUserDetails } from '../../models/User';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';
import database from './database';
import {
  InstrumentRecord,
  UserRecord,
  createBasicUserObject,
  InstrumentWithAvailabilityTimeRecord,
} from './records';

export default class PostgresInstrumentDataSource
  implements InstrumentDataSource {
  private createInstrumentObject(instrument: InstrumentRecord) {
    return new Instrument(
      instrument.instrument_id,
      instrument.name,
      instrument.short_code,
      instrument.description
    );
  }

  private createInstrumentWithAvailabilityTimeObject(
    instrument: InstrumentWithAvailabilityTimeRecord
  ) {
    return new InstrumentWithAvailabilityTime(
      instrument.instrument_id,
      instrument.name,
      instrument.short_code,
      instrument.description,
      instrument.availability_time,
      instrument.submitted
    );
  }

  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    return database
      .insert({
        name: args.name,
        short_code: args.shortCode,
        description: args.description,
      })
      .into('instruments')
      .returning(['*'])
      .then((instrument: InstrumentRecord[]) => {
        if (instrument.length !== 1) {
          throw new Error('Could not create instrument');
        }

        return this.createInstrumentObject(instrument[0]);
      });
  }

  async get(instrumentId: number): Promise<Instrument | null> {
    return database
      .select()
      .from('instruments')
      .where('instrument_id', instrumentId)
      .first()
      .then((instrument: InstrumentRecord | null) =>
        instrument ? this.createInstrumentObject(instrument) : null
      );
  }

  async getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('instruments')
      .orderBy('instrument_id', 'desc')
      .modify(query => {
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((instruments: InstrumentRecord[]) => {
        const result = instruments.map(instrument =>
          this.createInstrumentObject(instrument)
        );

        return {
          totalCount: instruments[0] ? instruments[0].full_count : 0,
          instruments: result,
        };
      });
  }

  async getInstrumentsByCallId(
    callIds: number[]
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return database
      .select([
        'i.instrument_id',
        'name',
        'short_code',
        'description',
        'chi.availability_time',
      ])
      .from('instruments as i')
      .join('call_has_instruments as chi', {
        'i.instrument_id': 'chi.instrument_id',
      })
      .whereIn('chi.call_id', callIds)
      .distinct('i.instrument_id')
      .then((instruments: InstrumentWithAvailabilityTimeRecord[]) => {
        const result = instruments.map(instrument =>
          this.createInstrumentWithAvailabilityTimeObject(instrument)
        );

        return result;
      });
  }

  async getCallsByInstrumentId(
    instrumentId: number,
    callIds: number[]
  ): Promise<{ callId: number; instrumentId: number }[]> {
    return database
      .select(['call_id', 'instrument_id'])
      .from('call_has_instruments')
      .whereIn('call_id', callIds)
      .andWhere('instrument_id', instrumentId)
      .then((calls: { call_id: number; instrument_id: number }[]) => {
        const result = calls.map(call => ({
          callId: call.call_id,
          instrumentId: call.instrument_id,
        }));

        return result;
      });
  }

  async getUserInstruments(userId: number): Promise<Instrument[]> {
    return database
      .select(['i.instrument_id', 'name', 'short_code', 'description'])
      .from('instruments as i')
      .join('instrument_has_scientists as ihs', {
        'i.instrument_id': 'ihs.instrument_id',
      })
      .where('ihs.user_id', userId)
      .then((instruments: InstrumentRecord[]) => {
        const result = instruments.map(instrument =>
          this.createInstrumentObject(instrument)
        );

        return result;
      });
  }

  async update(instrument: Instrument): Promise<Instrument> {
    return database
      .update(
        {
          name: instrument.name,
          short_code: instrument.shortCode,
          description: instrument.description,
        },
        ['*']
      )
      .from('instruments')
      .where('instrument_id', instrument.id)
      .then((records: InstrumentRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Instrument not found ${instrument.id}`);
        }

        return this.createInstrumentObject(records[0]);
      });
  }

  async delete(instrumentId: number): Promise<Instrument> {
    return database('instruments')
      .where('instrument_id', instrumentId)
      .del()
      .returning('*')
      .then((instrument: InstrumentRecord[]) => {
        if (instrument === undefined || instrument.length !== 1) {
          throw new Error(
            `Could not delete instrument with id: ${instrumentId} `
          );
        }

        return this.createInstrumentObject(instrument[0]);
      });
  }

  async assignProposalsToInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<ProposalIds> {
    const dataToInsert = proposalIds.map(proposalId => ({
      instrument_id: instrumentId,
      proposal_id: proposalId,
    }));

    const proposalInstrumentPairs: {
      proposal_id: number;
      instrument_id: number;
    }[] = await database('instrument_has_proposals')
      .insert(dataToInsert)
      .returning(['*']);

    const returnedProposalIds = proposalInstrumentPairs.map(
      proposalInstrumentPair => proposalInstrumentPair.proposal_id
    );

    if (proposalInstrumentPairs) {
      /**
       * NOTE: We need to return changed proposalIds because we listen to events and
       * we need to do some changes on proposals based on what is changed.
       */
      return new ProposalIds(returnedProposalIds);
    }

    throw new Error(
      `Could not assign proposals ${proposalIds} to instrument with id: ${instrumentId} `
    );
  }

  async removeProposalFromInstrument(
    proposalId: number,
    instrumentId: number
  ): Promise<boolean> {
    const result = await database('instrument_has_proposals')
      .where('instrument_id', instrumentId)
      .andWhere('proposal_id', proposalId)
      .del();

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async getInstrumentByProposalId(
    proposalId: number
  ): Promise<Instrument | null> {
    return database
      .select(['i.instrument_id', 'name', 'short_code', 'description'])
      .from('instruments as i')
      .join('instrument_has_proposals as ihp', {
        'i.instrument_id': 'ihp.instrument_id',
      })
      .where('ihp.proposal_id', proposalId)
      .first()
      .then((instrument: InstrumentRecord) => {
        if (!instrument) {
          return null;
        }

        const result = this.createInstrumentObject(instrument);

        return result;
      });
  }

  async getInstrumentsBySepId(
    sepId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return database
      .select([
        'i.instrument_id',
        'name',
        'i.short_code',
        'description',
        'chi.availability_time',
        'chi.submitted',
        database.raw(
          `count(sp.proposal_id) filter (where sp.sep_id = ${sepId} and sp.call_id = ${callId}) as proposal_count`
        ),
        database.raw(
          `count(*) filter (where sp.call_id = ${callId}) as full_count`
        ),
      ])
      .from('instruments as i')
      .join('instrument_has_proposals as ihp', {
        'i.instrument_id': 'ihp.instrument_id',
      })
      .join('SEP_Proposals as sp', {
        'sp.proposal_id': 'ihp.proposal_id',
      })
      .join('call_has_instruments as chi', {
        'chi.instrument_id': 'i.instrument_id',
        'chi.call_id': callId,
      })
      .groupBy(['i.instrument_id', 'chi.availability_time', 'chi.submitted'])
      .having(
        database.raw(
          `count(sp.proposal_id) filter (where sp.sep_id = ${sepId} and sp.call_id = ${callId}) > 0`
        )
      )
      .then(async (instruments: InstrumentWithAvailabilityTimeRecord[]) => {
        const result = instruments.map(instrument => {
          const calculatedInstrumentAvailabilityTimePerSEP = Math.round(
            (instrument.proposal_count / instrument.full_count) *
              instrument.availability_time
          );

          return this.createInstrumentWithAvailabilityTimeObject({
            ...instrument,
            availability_time: calculatedInstrumentAvailabilityTimePerSEP,
          });
        });

        return result;
      });
  }

  async assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean> {
    const dataToInsert = scientistIds.map(scientistId => ({
      instrument_id: instrumentId,
      user_id: scientistId,
    }));

    const result = await database('instrument_has_scientists').insert(
      dataToInsert
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean> {
    const result = await database('instrument_has_scientists')
      .where('instrument_id', instrumentId)
      .andWhere('user_id', scientistId)
      .del();

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async getInstrumentScientists(
    instrumentId: number
  ): Promise<BasicUserDetails[]> {
    return database
      .select('*')
      .from('users as u')
      .join('instrument_has_scientists as ihs', {
        'u.user_id': 'ihs.user_id',
      })
      .join('institutions as i', { 'u.organisation': 'i.institution_id' })
      .where('ihs.instrument_id', instrumentId)
      .then((usersRecord: UserRecord[]) => {
        const users = usersRecord.map(user => createBasicUserObject(user));

        return users;
      });
  }

  async setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean> {
    const result = await database.raw(
      `${database('call_has_instruments').insert({
        instrument_id: instrumentId,
        call_id: callId,
        availability_time: availabilityTime,
      })} ON CONFLICT (instrument_id, call_id) DO UPDATE SET availability_time=${availabilityTime}`
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async submitInstrument(
    callId: number,
    instrumentId: number
  ): Promise<boolean> {
    const result = await database('call_has_instruments')
      .update({
        submitted: true,
      })
      .where('instrument_id', instrumentId)
      .andWhere('call_id', callId);

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean> {
    return database
      .count('*')
      .from('instruments as i')
      .join('instrument_has_scientists as ihs', {
        'i.instrument_id': 'ihs.instrument_id',
      })
      .where('ihs.user_id', userId)
      .where('i.instrument_id', instrumentId)
      .first()
      .then((result: undefined | { count: string }) => {
        return result?.count === '1';
      });
  }

  async hasInstrumentScientistAccess(
    scientistId: number,
    instrumentId: number,
    proposalId: number
  ): Promise<boolean> {
    return database
      .select([database.raw('count(*) OVER() AS count')])
      .from('proposals')
      .join('instrument_has_scientists', {
        'instrument_has_scientists.user_id': scientistId,
      })
      .join('instrument_has_proposals', {
        'instrument_has_proposals.proposal_id': 'proposals.proposal_id',
        'instrument_has_proposals.instrument_id':
          'instrument_has_scientists.instrument_id',
      })
      .where('proposals.proposal_id', '=', proposalId)
      .where('instrument_has_scientists.instrument_id', '=', instrumentId)
      .first()
      .then((result: undefined | { count: string }) => {
        return result?.count === '1';
      });
  }
}
