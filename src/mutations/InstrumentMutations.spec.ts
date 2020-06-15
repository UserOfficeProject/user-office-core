import 'reflect-metadata';
import {
  InstrumentDataSourceMock,
  dummyInstrument,
} from '../datasources/mockups/InstrumentDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import InstrumentMutations from './InstrumentMutations';

const instrumentMutations = new InstrumentMutations(
  new InstrumentDataSourceMock()
);

describe('Test Instrument Mutations', () => {
  test('A user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(dummyUserWithRole, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(null, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can create an instrument', () => {
    return expect(
      instrumentMutations.create(dummyUserOfficerWithRole, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
      })
    ).resolves.toBe(dummyInstrument);
  });

  test('A logged in user officer can update instrument', () => {
    return expect(
      instrumentMutations.update(dummyUserOfficerWithRole, {
        instrumentId: 1,
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
      })
    ).resolves.toBe(dummyInstrument);
  });

  test('A logged in user officer can delete instrument', () => {
    return expect(
      instrumentMutations.delete(dummyUserOfficerWithRole, {
        instrumentId: 1,
      })
    ).resolves.toBe(dummyInstrument);
  });
});
