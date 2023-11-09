import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Shipment } from '../types/Shipment';

@Resolver()
export class DeleteShipment {
  @Mutation(() => Shipment)
  deleteShipment(
    @Arg('shipmentId', () => Int) shipmentId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.shipment.deleteShipment(context.user, shipmentId);
  }
}
