import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import {
  dummyUserOfficerWithRole,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import SampleQueries from './SampleQueries';
import { questionaryDataSource } from '../datasources';
import { questionaryAuthorization } from '../utils/QuestionaryAuthorization';
const dummySampleDataSource = new SampleDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const sampleQueries = new SampleQueries(
  dummySampleDataSource,
  questionaryDataSource,
  userAuthorization,
  questionaryAuthorization
);

beforeEach(() => {
  dummySampleDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});
