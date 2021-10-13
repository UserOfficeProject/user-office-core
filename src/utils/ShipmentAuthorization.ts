import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { UserWithRole } from '../models/User';
import { Shipment } from './../resolvers/types/Shipment';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ShipmentAuthorization {
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
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
    // User officer has read/write rights
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const shipment = await this.resolveShipment(shipmentOrShipmentId);
    if (!shipment) {
      return false;
    }

    /*
     * For the shipment the authorization follows the business logic for the proposal
     * authorization that the shipment is associated with
     */
    return this.userAuthorization.hasAccessRights(agent, shipment.proposalPk);
  }
}
