import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import ShipmentQueries from './ShipmentQueries';

const shipmentQueries = container.resolve(ShipmentQueries);

beforeEach(() => {
  container.resolve<ShipmentDataSourceMock>(Tokens.ShipmentDataSource).init();
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
