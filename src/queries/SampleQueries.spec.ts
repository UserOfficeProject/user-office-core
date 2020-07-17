import 'reflect-metadata';
import {
  dummyUserOfficerWithRole,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import SampleQueries from './SampleQueries';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
const dummySampleDataSource = new SampleDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const sampleQueries = new SampleQueries(
  dummySampleDataSource,
  userAuthorization
);

beforeEach(() => {
  dummySampleDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});
