import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { ShipmentAuthorization } from '../auth/ShipmentAuthorization';
import { Tokens } from '../config/Tokens';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';

@injectable()
export default class ShipmentQueries {
  private shipmentAuth = container.resolve(ShipmentAuthorization);

  constructor(
    @inject(Tokens.ShipmentDataSource) private dataSource: ShipmentDataSource
  ) {}

  async getShipment(agent: UserWithRole | null, shipmentId: number) {
    const hasRights = await this.shipmentAuth.hasReadRights(agent, shipmentId);
    if (hasRights == false) {
      logger.logWarn('Unauthorized getShipment access', { agent, shipmentId });

      return null;
    }

    return this.dataSource.getShipment(shipmentId);
  }

  @Authorized()
  async getShipments(agent: UserWithRole | null, args: ShipmentsArgs) {
    let shipments = await this.dataSource.getShipments(args);

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuth.hasReadRights(agent, shipment)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getShipmentsByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getShipmentsByCallId(callId);
  }

  @Authorized()
  async getMyShipments(agent: UserWithRole | null) {
    let shipments = await this.dataSource.getShipments({
      filter: { creatorId: agent!.id },
    });

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuth.hasReadRights(agent, shipment)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }
}
