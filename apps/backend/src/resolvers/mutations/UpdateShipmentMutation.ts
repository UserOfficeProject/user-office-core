import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ShipmentStatus } from '../../models/Shipment';
import { Shipment } from '../types/Shipment';

@ArgsType()
export class UpdateShipmentArgs {
  @Field(() => Int)
  shipmentId: number;

  @Field(() => Int, { nullable: true })
  proposalPk?: number;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => ShipmentStatus, { nullable: true })
  status?: ShipmentStatus;

  @Field(() => String, { nullable: true })
  externalRef?: string;
}

@Resolver()
export class UpdateShipmentMutation {
  @Mutation(() => Shipment)
  updateShipment(
    @Args() args: UpdateShipmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.shipment.updateShipment(context.user, args);
  }
}
