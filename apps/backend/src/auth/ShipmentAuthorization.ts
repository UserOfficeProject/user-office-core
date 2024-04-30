import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { UserWithRole } from '../models/User';
import { Shipment } from './../resolvers/types/Shipment';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ShipmentAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
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
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const shipment = await this.resolveShipment(shipmentOrShipmentId);
    if (!shipment) {
      return false;
    }

    return this.proposalAuth.hasReadRights(agent, shipment.proposalPk);
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
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const shipment = await this.resolveShipment(shipmentOrShipmentId);
    if (!shipment) {
      return false;
    }

    return this.proposalAuth.hasReadRights(agent, shipment.proposalPk);
  }
}
