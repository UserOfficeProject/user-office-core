import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ShipmentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteShipment {
  @Mutation(() => ShipmentResponseWrap)
  deleteShipment(
    @Arg('shipmentId', () => Int) shipmentId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.shipment.deleteShipment(context.user, shipmentId),
      ShipmentResponseWrap
    );
  }
}
