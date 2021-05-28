import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import {
  Instrument,
  InstrumentHasProposals,
  InstrumentWithAvailabilityTime,
} from '../../models/Instrument';
import { ProposalIdsWithNextStatus } from '../../models/Proposal';
import { BasicUserDetails } from '../../models/User';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import {
  InstrumentRecord,
  UserRecord,
  createBasicUserObject,
  InstrumentWithAvailabilityTimeRecord,
  InstrumentHasProposalsRecord,
} from './records';

@injectable()
export default class PostgresInstrumentDataSource
  implements InstrumentDataSource {
  constructor(
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource
  ) {}
  private createInstrumentObject(instrument: InstrumentRecord) {
    return new Instrument(
      instrument.instrument_id,
      instrument.name,
      instrument.short_code,
      instrument.description,
      instrument.manager_user_id
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
      instrument.manager_user_id,
      instrument.availability_time,
      instrument.submitted
    );
  }

  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    const [instrumentRecord]: InstrumentRecord[] = await database
      .insert({
        name: args.name,
        short_code: args.shortCode,
        description: args.description,
        manager_user_id: args.managerUserId,
      })
      .into('instruments')
      .returning('*');

    if (!instrumentRecord) {
      throw new Error('Could not create instrument');
    }

    return this.createInstrumentObject(instrumentRecord);
  }

  async getInstrument(instrumentId: number): Promise<Instrument | null> {
    return database
      .select()
      .from('instruments')
      .where('instrument_id', instrumentId)
      .first()
      .then((instrument: InstrumentRecord | null) =>
        instrument ? this.createInstrumentObject(instrument) : null
      );
  }

  async getInstruments(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('instruments')
      .orderBy('instrument_id', 'desc')
      .modify((query) => {
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((instruments: InstrumentRecord[]) => {
        const result = instruments.map((instrument) =>
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
        'manager_user_id',
        'chi.availability_time',
      ])
      .from('instruments as i')
      .join('call_has_instruments as chi', {
        'i.instrument_id': 'chi.instrument_id',
      })
      .whereIn('chi.call_id', callIds)
      .distinct('i.instrument_id')
      .then((instruments: InstrumentWithAvailabilityTimeRecord[]) => {
        const result = instruments.map((instrument) =>
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
        const result = calls.map((call) => ({
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
        const result = instruments.map((instrument) =>
          this.createInstrumentObject(instrument)
        );

        return result;
      });
  }

  async update(instrument: Instrument): Promise<Instrument> {
    const [instrumentRecord]: InstrumentRecord[] = await database
      .update(
        {
          name: instrument.name,
          short_code: instrument.shortCode,
          description: instrument.description,
          manager_user_id: instrument.managerUserId,
        },
        ['*']
      )
      .from('instruments')
      .where('instrument_id', instrument.id);

    if (!instrumentRecord) {
      throw new Error(`Instrument not found ${instrument.id}`);
    }

    return this.createInstrumentObject(instrumentRecord);
  }

  async delete(instrumentId: number): Promise<Instrument> {
    const [instrumentRecord]: InstrumentRecord[] = await database('instruments')
      .where('instrument_id', instrumentId)
      .del()
      .returning('*');

    if (!instrumentRecord) {
      throw new Error(`Could not delete instrument with id: ${instrumentId} `);
    }

    return this.createInstrumentObject(instrumentRecord);
  }

  async assignProposalsToInstrument(
    proposalIds: number[],
    instrumentId: number
  ): Promise<ProposalIdsWithNextStatus> {
    const dataToInsert = proposalIds.map((proposalId) => ({
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
      (proposalInstrumentPair) => proposalInstrumentPair.proposal_id
    );

    if (proposalInstrumentPairs) {
      /**
       * NOTE: We need to return changed proposalIds because we listen to events and
       * we need to do some changes on proposals based on what is changed.
       */
      return new ProposalIdsWithNextStatus(returnedProposalIds);
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

  async checkIfAllProposalsOnInstrumentSubmitted(
    instruments: InstrumentWithAvailabilityTimeRecord[],
    sepId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTimeRecord[]> {
    const instrumentsWithSubmittedFlag: InstrumentWithAvailabilityTimeRecord[] = [];

    for (const instrument of instruments) {
      const allProposalsOnInstrument = await this.sepDataSource.getSEPProposalsByInstrument(
        sepId,
        instrument.instrument_id,
        callId
      );

      const allProposalsOnInstrumentSubmitted = allProposalsOnInstrument.every(
        (item) => item.instrumentSubmitted
      );

      instrumentsWithSubmittedFlag.push({
        ...instrument,
        submitted: allProposalsOnInstrumentSubmitted,
      });
    }

    return instrumentsWithSubmittedFlag;
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
        const instrumentsWithSubmittedFlag = await this.checkIfAllProposalsOnInstrumentSubmitted(
          instruments,
          sepId,
          callId
        );

        const result = instrumentsWithSubmittedFlag.map((instrument) => {
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
    const dataToInsert = scientistIds.map((scientistId) => ({
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
        const users = usersRecord.map((user) => createBasicUserObject(user));

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
    proposalIds: number[],
    instrumentId: number
  ): Promise<InstrumentHasProposals> {
    const records: InstrumentHasProposalsRecord[] = await database(
      'instrument_has_proposals'
    )
      .update(
        {
          submitted: true,
        },
        ['*']
      )
      .whereIn('proposal_id', proposalIds)
      .andWhere('instrument_id', instrumentId);

    if (!records?.length) {
      throw new Error(
        `Some record from instrument_has_proposals not found with proposalIds: ${proposalIds} and instrumentId: ${instrumentId}`
      );
    }

    return new InstrumentHasProposals(instrumentId, proposalIds, true);
  }

  async hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean> {
    const result:
      | { count?: string | number | undefined }
      | undefined = await database
      .count({ count: '*' })
      .from('instruments as i')
      .join('instrument_has_scientists as ihs', {
        'i.instrument_id': 'ihs.instrument_id',
      })
      .where('ihs.user_id', userId)
      .where('i.instrument_id', instrumentId)
      .first();

    return result?.count === '1';
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

  async isProposalInstrumentSubmitted(proposalId: number): Promise<boolean> {
    return database('instrument_has_proposals')
      .select()
      .where('proposal_id', proposalId)
      .first()
      .then((result?: InstrumentHasProposalsRecord) => {
        if (!result) {
          return false;
        }

        return result.submitted;
      });
  }
}
