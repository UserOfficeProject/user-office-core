import 'reflect-metadata';
import { questionaryDataSource } from '../datasources';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import SampleQueries from './SampleQueries';

const dummySampleDataSource = new SampleDataSourceMock();
const sampleQueries = new SampleQueries(
  dummySampleDataSource,
  questionaryDataSource
);

beforeEach(() => {
  dummySampleDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});
