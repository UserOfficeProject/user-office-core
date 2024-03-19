/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Instrument,
  InstrumentsHasProposals,
  InstrumentWithAvailabilityTime,
  InstrumentWithManagementTime,
} from '../../models/Instrument';
import { BasicUserDetails } from '../../models/User';
import { ManagementTimeAllocationsInput } from '../../resolvers/mutations/AdministrationProposalMutation';
import { CreateInstrumentArgs } from '../../resolvers/mutations/CreateInstrumentMutation';
import { InstrumentDataSource } from '../InstrumentDataSource';
import { basicDummyUser } from './UserDataSource';

export const dummyInstrument = new Instrument(
  1,
  'Dummy instrument 1',
  'instrument_1',
  'This is test instrument.',
  1
);

export const dummyInstrument2 = new Instrument(
  2,
  'Dummy instrument 2',
  'instrument_2',
  'This is test instrument.',
  1
);

export const dummyInstrumentWithAvailabilityTime =
  new InstrumentWithAvailabilityTime(
    1,
    'Dummy instrument 1',
    'instrument_1',
    'This is test instrument.',
    1,
    10,
    false,
    1
  );

export const dummyInstrumentWithManagementTime =
  new InstrumentWithManagementTime(
    1,
    'Dummy instrument 1',
    'instrument_1',
    'This is test instrument.',
    1,
    10
  );

const dummyInstruments = [dummyInstrument, dummyInstrument2];

export const dummyInstrumentHasProposals = new InstrumentsHasProposals(
  [1],
  [1],
  true
);

export class InstrumentDataSourceMock implements InstrumentDataSource {
  async assignScientistToInstruments(
    scientistId: number,
    instrumentIds: number[]
  ): Promise<boolean> {
    return true;
  }

  async removeScientistFromInstruments(
    scientistId: number,
    instrumentIds: number[]
  ): Promise<boolean> {
    return true;
  }

  async getInstrumentsByNames(
    instrumentNames: string[]
  ): Promise<Instrument[]> {
    return [dummyInstrument];
  }

  async getInstrumentsByIds(instrumentids: number[]): Promise<Instrument[]> {
    return [dummyInstrument];
  }

  async create(args: CreateInstrumentArgs): Promise<Instrument> {
    return { ...dummyInstrument, ...args };
  }

  async getInstrument(instrumentId: number): Promise<Instrument | null> {
    const instrument = dummyInstruments.find(
      (dummyInstrumentItem) => dummyInstrumentItem.id === instrumentId
    );

    if (instrument) {
      return instrument;
    } else {
      return null;
    }
  }

  async getInstruments(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    return { totalCount: 1, instruments: [dummyInstrument] };
  }

  async update(instrument: Instrument): Promise<Instrument> {
    return { ...dummyInstrument, ...instrument };
  }

  async delete(instrumentId: number): Promise<Instrument> {
    return dummyInstrument;
  }

  async getUserInstruments(userId: number): Promise<Instrument[]> {
    return [dummyInstrument];
  }

  async getInstrumentsByCallId(
    callIds: number[]
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return [dummyInstrumentWithAvailabilityTime];
  }

  async getCallsByInstrumentId(instrumentId: number, callIds: number[]) {
    return [{ callId: 1, instrumentId: 1 }];
  }

  async assignProposalToInstrument(
    proposalPk: number,
    instrumentId: number
  ): Promise<InstrumentsHasProposals> {
    return new InstrumentsHasProposals([instrumentId], [proposalPk], false);
  }

  async removeProposalsFromInstrument(
    proposalPks: number[],
    instrumentId?: number
  ): Promise<boolean> {
    return true;
  }

  async getInstrumentByProposalPk(
    proposalPk: number
  ): Promise<Instrument | null> {
    return dummyInstrument;
  }

  async getInstrumentsByFapId(
    fapId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]> {
    return [dummyInstrumentWithAvailabilityTime];
  }

  async assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean> {
    return true;
  }

  async getInstrumentScientists(): Promise<BasicUserDetails[]> {
    return [basicDummyUser];
  }

  async getInstrumentsByProposalPk(
    proposalPk: number
  ): Promise<InstrumentWithManagementTime[]> {
    return [dummyInstrumentWithManagementTime];
  }

  async updateProposalInstrumentTimeAllocation(
    proposalPk: number,
    managementTimeAllocations: ManagementTimeAllocationsInput[]
  ): Promise<boolean> {
    return true;
  }

  async setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean> {
    return true;
  }

  async submitInstrument(
    proposalPks: number[],
    instrumentId: number
  ): Promise<InstrumentsHasProposals> {
    return dummyInstrumentHasProposals;
  }

  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  hasInstrumentScientistAccess(
    userId: number,
    instrumentId: number,
    proposalPk: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
