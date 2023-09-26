import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyInstrument } from '../datasources/mockups/InstrumentDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import InstrumentQueries from './InstrumentQueries';

const InstrumentQueriesInstance = container.resolve(InstrumentQueries);

describe('Test Instrument Queries', () => {
  // for new skip this test as the decorator is disabled
  test.skip('A user cannot query all Instruments', () => {
    return expect(
      InstrumentQueriesInstance.getAll(dummyUserWithRole, [])
    ).resolves.toBe(null);
  });

  test('A userofficer can get all Instruments', () => {
    return expect(
      InstrumentQueriesInstance.getAll(dummyUserOfficerWithRole, [])
    ).resolves.toStrictEqual({ totalCount: 1, instruments: [dummyInstrument] });
  });

  test('A userofficer can get Instrument by instrumentId', () => {
    return expect(
      InstrumentQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyInstrument);
  });
});
