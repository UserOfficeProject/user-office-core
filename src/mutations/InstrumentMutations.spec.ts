import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyInstrument,
  dummyInstrumentHasProposals,
} from '../datasources/mockups/InstrumentDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import InstrumentMutations from './InstrumentMutations';

const instrumentMutations = container.resolve(InstrumentMutations);

describe('Test Instrument Mutations', () => {
  test('A user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(dummyUserWithRole, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
        managerUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(null, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
        managerUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can create an instrument', () => {
    const instrumentToCreate = {
      name: 'Test Instrument',
      shortCode: '2020-06-15',
      description: 'Test instrument description',
      managerUserId: 1,
    };

    return expect(
      instrumentMutations.create(dummyUserOfficerWithRole, instrumentToCreate)
    ).resolves.toStrictEqual({ id: 1, ...instrumentToCreate });
  });

  test('A logged in user officer can update instrument', () => {
    const instrumentToUpdate = {
      id: 1,
      name: 'Test Instrument 1',
      shortCode: '2020-06-15',
      description: 'Test instrument description 1',
      managerUserId: 1,
    };

    return expect(
      instrumentMutations.update(dummyUserOfficerWithRole, instrumentToUpdate)
    ).resolves.toStrictEqual({ ...instrumentToUpdate });
  });

  test('A logged in user officer can delete instrument', () => {
    return expect(
      instrumentMutations.delete(dummyUserOfficerWithRole, {
        id: 1,
      })
    ).resolves.toBe(dummyInstrument);
  });

  test('A logged in user officer can assign proposal/s to instrument', () => {
    return expect(
      instrumentMutations.assignProposalsToInstrument(
        dummyUserOfficerWithRole,
        {
          proposals: [
            { primaryKey: 1, callId: 1 },
            { primaryKey: 2, callId: 1 },
          ],
          instrumentId: 1,
        }
      )
    ).resolves.toStrictEqual({ proposalPks: [1, 2] });
  });

  test('A logged in user officer can remove assigned proposal from instrument', () => {
    return expect(
      instrumentMutations.removeProposalsFromInstrument(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1],
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can assign scientist/s to instrument', () => {
    return expect(
      instrumentMutations.assignScientsitsToInstrument(
        dummyUserOfficerWithRole,
        {
          scientistIds: [1, 2],
          instrumentId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can remove assigned scientist from instrument', () => {
    return expect(
      instrumentMutations.removeScientistFromInstrument(
        dummyUserOfficerWithRole,
        {
          scientistId: 1,
          instrumentId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can not set availability time on instrument to negative value', () => {
    return expect(
      instrumentMutations.setAvailabilityTimeOnInstrument(
        dummyUserOfficerWithRole,
        {
          callId: 1,
          instrumentId: 1,
          availabilityTime: -1,
        }
      )
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A logged in user officer can set availability time on instrument attached to a call', () => {
    return expect(
      instrumentMutations.setAvailabilityTimeOnInstrument(
        dummyUserOfficerWithRole,
        {
          callId: 1,
          instrumentId: 1,
          availabilityTime: 10,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can submit instrument attached to a call from a SEP', () => {
    return expect(
      instrumentMutations.submitInstrument(dummyUserOfficerWithRole, {
        instrumentId: 1,
        callId: 1,
        sepId: 1,
      })
    ).resolves.toBe(dummyInstrumentHasProposals);
  });
});
