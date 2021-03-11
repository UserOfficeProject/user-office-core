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
import { ShipmentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class SubmitShipmentArgs {
  @Field(() => Int)
  shipmentId: number;
}

@Resolver()
export class SubmitShipmentMutation {
  @Mutation(() => ShipmentResponseWrap)
  submitShipment(
    @Args() input: SubmitShipmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.shipment.submitShipment(context.user, input),
      ShipmentResponseWrap
    );
  }
}
