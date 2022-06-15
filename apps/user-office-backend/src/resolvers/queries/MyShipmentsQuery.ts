import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Shipment } from '../types/Shipment';

@Resolver()
export class MyShipmentsQuery {
  @Query(() => [Shipment], { nullable: true })
  async myShipments(@Ctx() context: ResolverContext) {
    const response = await context.queries.shipment.getMyShipments(
      context.user
    );

    return response;
  }
}
