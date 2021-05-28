import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSourceMock } from '../datasources/mockups/ShipmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { isRejection } from '../models/Rejection';
import { Shipment } from '../models/Shipment';
import ShipmentMutations from './ShipmentMutations';

const mutations = container.resolve(ShipmentMutations);

beforeEach(() => {
  container.resolve<ShipmentDataSourceMock>(Tokens.ShipmentDataSource).init();
});

test('User can submit shipment', async () => {
  const result = await mutations.submitShipment(dummyUserWithRole, {
    shipmentId: 1,
  });

  expect((result as Shipment).id).toEqual(1);
});

test('User not on proposal can not submit shipment', async () => {
  const result = await mutations.submitShipment(
    dummyUserNotOnProposalWithRole,
    {
      shipmentId: 1,
    }
  );

  expect(isRejection(result)).toBeTruthy();
});

test('User can update shipment', async () => {
  const updatedTitle = 'Updated title';
  const result = await mutations.updateShipment(dummyUserWithRole, {
    shipmentId: 1,
    title: updatedTitle,
  });

  expect((result as Shipment).title).toEqual(updatedTitle);
});

test('User not on proposal can not update shipment', async () => {
  const result = await mutations.updateShipment(
    dummyUserNotOnProposalWithRole,
    {
      shipmentId: 1,
      title: 'This is not my proposal',
    }
  );

  expect(isRejection(result)).toBeTruthy();
});

test('User can delete shipment', async () => {
  const result = await mutations.deleteShipment(dummyUserWithRole, 1);

  expect((result as Shipment).id).toEqual(1);
});

test('User not on proposal can not delete shipment', async () => {
  const result = await mutations.deleteShipment(
    dummyUserNotOnProposalWithRole,
    1
  );

  expect(isRejection(result)).toBeTruthy();
});

test('User can add samples to shipment', async () => {
  const result = await mutations.addSamples(dummyUserWithRole, {
    shipmentId: 1,
    sampleIds: [1],
  });

  expect(isRejection(result)).toBeFalsy();
});

test('User not on proposal can not add samples to shipment', async () => {
  const result = await mutations.addSamples(dummyUserNotOnProposalWithRole, {
    shipmentId: 1,
    sampleIds: [1],
  });

  expect(isRejection(result)).toBeTruthy();
});
