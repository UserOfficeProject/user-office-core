import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ShipmentStatus } from '../../models/Shipment';
import { Shipment } from '../types/Shipment';

@InputType()
class ShipmentsFilter {
  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => Int, { nullable: true })
  public proposalPk?: number;

  @Field(() => [Int], { nullable: true })
  public questionaryIds?: number[];

  @Field(() => ShipmentStatus, { nullable: true })
  public status?: ShipmentStatus;

  @Field(() => String, { nullable: true })
  public externalRef?: string;

  @Field(() => [Int], { nullable: true })
  public shipmentIds?: number[];

  @Field(() => Int, { nullable: true })
  public scheduledEventId?: number;
}

@ArgsType()
export class ShipmentsArgs {
  @Field(() => ShipmentsFilter, { nullable: true })
  public filter?: ShipmentsFilter;
}
@Resolver()
export class ShipmentsQuery {
  @Query(() => [Shipment], { nullable: true })
  async shipments(
    @Ctx() context: ResolverContext,
    @Args() args: ShipmentsArgs
  ) {
    const response = await context.queries.shipment.getShipments(
      context.user,
      args
    );

    return response;
  }
}
