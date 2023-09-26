import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Shipment } from '../types/Shipment';

@Resolver()
export class ShipmentQuery {
  @Query(() => Shipment, { nullable: true })
  shipment(
    @Ctx() context: ResolverContext,
    @Arg('shipmentId', () => Int) shipmentId: number
  ) {
    return context.queries.shipment.getShipment(context.user, shipmentId);
  }
}
