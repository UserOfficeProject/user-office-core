import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import SampleQueries from './SampleQueries';

const dummySampleDataSource = new SampleDataSourceMock();
const dummyProposalDataSource = new ProposalDataSourceMock();
const sampleAuthorization = new SampleAuthorization(
  dummySampleDataSource,
  dummyProposalDataSource
);
const sampleQueries = new SampleQueries(
  dummySampleDataSource,
  sampleAuthorization
);

beforeEach(() => {
  dummySampleDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});
