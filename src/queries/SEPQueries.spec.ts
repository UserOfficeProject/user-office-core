import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
  dummySEPs,
} from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import SEPQueries from './SEPQueries';

const dummySEPDataSource = new SEPDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const SEPQueriesInstance = new SEPQueries(
  dummySEPDataSource,
  userAuthorization
);

describe('Test SEPQueries', () => {
  test('A user cannot query all SEPs', () => {
    return expect(SEPQueriesInstance.getAll(dummyUser)).resolves.toBe(null);
  });

  test('A userofficer can get all SEPs if no filter is passed', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer)
    ).resolves.toStrictEqual({ totalCount: 2, seps: dummySEPs });
  });

  test('A userofficer can filter SEPs by `code` and `description`', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, 'SEP 2')
    ).resolves.toStrictEqual({ totalCount: 1, seps: [anotherDummySEP] });
  });

  test('A userofficer can get SEPs paginated', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficer, '', 1, 1)
    ).resolves.toStrictEqual({ totalCount: 1, seps: [dummySEP] });
  });

  test('A userofficer can get SEP by id', () => {
    return expect(
      SEPQueriesInstance.get(dummyUserOfficer, 1)
    ).resolves.toStrictEqual(dummySEP);
  });
});
