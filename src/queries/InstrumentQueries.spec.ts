import 'reflect-metadata';

import {
  InstrumentDataSourceMock,
  dummyInstrument,
} from '../datasources/mockups/InstrumentDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import InstrumentQueries from './InstrumentQueries';

const dummyInstrumentDataSource = new InstrumentDataSourceMock();
const dummySepDataSource = new SEPDataSourceMock();
const InstrumentQueriesInstance = new InstrumentQueries(
  dummyInstrumentDataSource,
  dummySepDataSource
);

describe('Test Instrument Queries', () => {
  test('A user cannot query all Instruments', () => {
    return expect(
      InstrumentQueriesInstance.getAll(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A userofficer can get all Instruments', () => {
    return expect(
      InstrumentQueriesInstance.getAll(dummyUserOfficerWithRole)
    ).resolves.toStrictEqual({ totalCount: 1, instruments: [dummyInstrument] });
  });

  test('A userofficer can get Instrument by instrumentId', () => {
    return expect(
      InstrumentQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyInstrument);
  });
});
