import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import ShipmentQueries from './ShipmentQueries';

const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyShipmentDataSource = new ShipmentDataSourceMock();

const shipmentAuthorization = new ShipmentAuthorization(
  dummyShipmentDataSource,
  dummyProposalDataSource
);
const shipmentQueries = new ShipmentQueries(
  dummyShipmentDataSource,
  shipmentAuthorization
);

beforeEach(() => {
  dummyProposalDataSource.init();
  dummyShipmentDataSource.init();
});

test('A userofficer can get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user can get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user not on proposal can not get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toBe(null);
});
