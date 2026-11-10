import 'reflect-metadata';
import { container } from 'tsyringe';

import InstrumentQueries from './InstrumentQueries';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { dummyInstrument } from '../datasources/mockups/InstrumentDataSource';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
  dummyUserOfficerWithDerivedRole,
  dummyInstrumentScientistWithDerivedRole,
} from '../datasources/mockups/UserDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';

const InstrumentQueriesInstance = container.resolve(InstrumentQueries);
const instrumentDataSource = container.resolve<InstrumentDataSource>(
  Tokens.InstrumentDataSource
);
const roleDataSource = container.resolve<RoleDataSource>(Tokens.RoleDataSource);

describe('Test Instrument Queries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  test('getAll filters instruments by derived role tags', async () => {
    jest
      .spyOn(roleDataSource, 'getTagsByRoleId')
      .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);
    const getInstruments = jest.spyOn(instrumentDataSource, 'getInstruments');

    await InstrumentQueriesInstance.getAll(dummyUserOfficerWithDerivedRole, []);

    expect(getInstruments).toHaveBeenCalledWith({ tagIds: [1] });
  });

  test('getUserInstruments filters user instruments by derived role tags', async () => {
    jest
      .spyOn(roleDataSource, 'getTagsByRoleId')
      .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);
    const getUserInstruments = jest.spyOn(
      instrumentDataSource,
      'getUserInstruments'
    );

    await InstrumentQueriesInstance.getUserInstruments(
      dummyInstrumentScientistWithDerivedRole
    );

    expect(getUserInstruments).toHaveBeenCalledWith(
      dummyInstrumentScientistWithDerivedRole.id,
      [1]
    );
  });

  test('getUserInstruments filters all instruments by derived user officer role tags', async () => {
    jest
      .spyOn(roleDataSource, 'getTagsByRoleId')
      .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);
    const getInstruments = jest.spyOn(instrumentDataSource, 'getInstruments');

    await InstrumentQueriesInstance.getUserInstruments(
      dummyUserOfficerWithDerivedRole
    );

    expect(getInstruments).toHaveBeenCalledWith({ tagIds: [1] });
  });
});
