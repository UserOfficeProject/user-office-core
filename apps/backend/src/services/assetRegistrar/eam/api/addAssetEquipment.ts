import { container } from 'tsyringe';

import { Tokens } from '../../../../config/Tokens';
import { ProposalDataSource } from '../../../../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../../../../datasources/ShipmentDataSource';
import getAddAssetEquipmentRequestPayload from '../requests/AddAssetEquipment';
import { createAndLogError } from '../utils/createAndLogError';
import { performApiRequest } from '../utils/performApiRequest';

/**
 * Creates Asset Equipment in EAM
 */
export async function createContainer(shipmentId: number) {
  const shipmentDataSource = container.resolve<ShipmentDataSource>(
    Tokens.ShipmentDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const shipment = await shipmentDataSource.getShipment(shipmentId);
  if (!shipment) {
    throw createAndLogError('Shipment for container not found', {
      shipmentId,
    });
  }

  const proposal = await proposalDataSource.get(shipment.proposalPk);
  if (!proposal) {
    throw createAndLogError('Proposal for container not found', {
      shipment,
    });
  }

  const requestPayload = getAddAssetEquipmentRequestPayload(
    proposal.proposalId,
    proposal.title
  );

  const {
    Result: {
      ResultData: {
        ASSETID: { EQUIPMENTCODE = null },
      },
    },
  } = await performApiRequest('/assets', requestPayload);

  if (!EQUIPMENTCODE) {
    throw createAndLogError('EAM Asset creation failed', {
      shipmentId,
      request: requestPayload,
    });
  }

  return EQUIPMENTCODE;
}
