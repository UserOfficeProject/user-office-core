import 'reflect-metadata';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
  dummySEPs,
  dummySEPAssignment,
  dummySEPMembers,
} from '../datasources/mockups/SEPDataSource';
import {
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import SEPQueries from './SEPQueries';

const dummySEPDataSource = new SEPDataSourceMock();
const SEPQueriesInstance = new SEPQueries(dummySEPDataSource);

describe('Test SEPQueries', () => {
  test('A user cannot query all SEPs', () => {
    return expect(SEPQueriesInstance.getAll(dummyUser)).resolves.toBe(null);
  });

  test('A userofficer can get all SEPs if no filter is passed', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, false)
    ).resolves.toStrictEqual({ totalCount: 2, seps: dummySEPs });
  });

  test('A userofficer can get only `active` SEPs', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, true)
    ).resolves.toStrictEqual({ totalCount: 1, seps: [dummySEP] });
  });

  test('A userofficer can filter SEPs by `code` and `description`', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, false, 'SEP 2')
    ).resolves.toStrictEqual({ totalCount: 1, seps: [anotherDummySEP] });
  });

  test('A userofficer can get SEPs paginated', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, false, '', 1, 1)
    ).resolves.toStrictEqual({ totalCount: 1, seps: [dummySEP] });
  });

  test('A userofficer can get SEP by id', () => {
    return expect(
      SEPQueriesInstance.get(dummyUserOfficer, 1)
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A userofficer can get SEP Members by SEP id', () => {
    return expect(
      SEPQueriesInstance.getMembers(dummyUserOfficer, 1)
    ).resolves.toStrictEqual(dummySEPMembers);
  });

  test('A userofficer can get SEP Assignments by SEP id', () => {
    return expect(
      SEPQueriesInstance.getAssignments(dummyUserOfficer, {
        sepId: 1,
        proposalId: 1,
      })
    ).resolves.toStrictEqual([dummySEPAssignment]);
  });
});
