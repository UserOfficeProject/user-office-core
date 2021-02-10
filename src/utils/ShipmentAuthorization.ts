import { logger } from '@esss-swap/duo-logger';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from './UserAuthorization';

export class ShipmentAuthorization {
  constructor(
    private shipmentDataSource: ShipmentDataSource,
    private proposalDataSource: ProposalDataSource
  ) {}

  async hasReadRights(
    agent: UserWithRole | null,
    shipmentId: number | number[]
  ) {
    return this.hasAccessRights(agent, shipmentId);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    shipmentId: number | number[]
  ) {
    return await this.hasAccessRights(agent, shipmentId);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    shipmentId: number | number[]
  ) {
    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    if (typeof shipmentId === 'number') {
      return this.hasAccessToShipment(agent, shipmentId);
    }

    if (Array.isArray(shipmentId)) {
      return Promise.all(
        shipmentId.map(id => this.hasAccessToShipment(agent, id))
      );
    }

    throw new Error('Unsupported datatype');
  }

  private async hasAccessToShipment(
    agent: UserWithRole | null,
    shipmentId: number
  ) {
    const shipment = await this.shipmentDataSource.get(shipmentId);
    if (!shipment) {
      logger.logError('Could not find shipment', {
        shipmentId,
      });

      return false;
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalId);

    if (!proposal) {
      logger.logError('Could not find proposal for shipment', {
        shipmentId,
      });

      return false;
    }

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}
