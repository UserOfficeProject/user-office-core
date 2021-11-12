import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { UserWithRole } from '../models/User';
import { Shipment } from './../resolvers/types/Shipment';
import { ProposalAuthorization } from './ProposalAuthorization';

@injectable()
export class ShipmentAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource
  ) {}

  private async resolveShipment(
    shipmentOrShipmentId: Shipment | number
  ): Promise<Shipment | null> {
    let shipment;

    if (typeof shipmentOrShipmentId === 'number') {
      shipment = await this.shipmentDataSource.getShipment(
        shipmentOrShipmentId
      );
    } else {
      shipment = shipmentOrShipmentId;
    }

    return shipment;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    shipment: Shipment
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    shipmentId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    shipmentOrShipmentId: Shipment | number
  ): Promise<boolean> {
    return this.hasAccessRights(agent, shipmentOrShipmentId);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    shipment: Shipment
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    shipmentId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    shipmentOrShipmentId: Shipment | number
  ): Promise<boolean> {
    return await this.hasAccessRights(agent, shipmentOrShipmentId);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    shipmentOrShipmentId: Shipment | number
  ) {
    const shipment = await this.resolveShipment(shipmentOrShipmentId);
    if (!shipment) {
      return false;
    }

    /*
     * For the shipment the authorization follows the business logic for the proposal
     * authorization that the shipment is associated with, this should be changed
     */
    return this.proposalAuth.hasReadRights(agent, shipment.proposalPk);
  }
}
