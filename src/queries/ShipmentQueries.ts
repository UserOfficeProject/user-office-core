import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';

@injectable()
export default class ShipmentQueries {
  constructor(
    @inject(Tokens.ShipmentDataSource) private dataSource: ShipmentDataSource,
    @inject(Tokens.ShipmentAuthorization)
    private shipmentAuthorization: ShipmentAuthorization
  ) {}

  async getShipment(agent: UserWithRole | null, shipmentId: number) {
    if (
      (await this.shipmentAuthorization.hasReadRights(agent, shipmentId)) !==
      true
    ) {
      logger.logWarn('Unauthorized getShipment access', { agent, shipmentId });

      return null;
    }

    return this.dataSource.getShipment(shipmentId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getShipments(agent: UserWithRole | null, args: ShipmentsArgs) {
    let shipments = await this.dataSource.getShipments(args);

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuthorization.hasReadRights(agent, shipment.id)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getShipmentsByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getShipmentsByCallId(callId);
  }

  @Authorized([Roles.USER])
  async getMyShipments(agent: UserWithRole | null) {
    let shipments = await this.dataSource.getShipments({
      filter: { creatorId: agent!.id },
    });

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuthorization.hasReadRights(agent, shipment.id)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }
}
