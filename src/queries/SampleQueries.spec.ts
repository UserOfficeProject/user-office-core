import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import SampleQueries from './SampleQueries';

const dummySampleDataSource = new SampleDataSourceMock();
const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyShipmentDataSource = new ShipmentDataSourceMock();
const sampleAuthorization = new SampleAuthorization(
  dummySampleDataSource,
  dummyProposalDataSource
);
const shipmentAuthorization = new ShipmentAuthorization(
  dummyShipmentDataSource,
  dummyProposalDataSource
);
const sampleQueries = new SampleQueries(
  dummySampleDataSource,
  sampleAuthorization,
  shipmentAuthorization
);

beforeEach(() => {
  dummySampleDataSource.init();
  dummyProposalDataSource.init();
  dummyShipmentDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});

test('A userofficer can get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user of proposal can get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user not on proposal can not get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toBe(null);
});
