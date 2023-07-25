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
import { Shipment } from '../types/Shipment';

@ArgsType()
export class SubmitShipmentArgs {
  @Field(() => Int)
  shipmentId: number;
}

@Resolver()
export class SubmitShipmentMutation {
  @Mutation(() => Shipment)
  submitShipment(
    @Args() input: SubmitShipmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.shipment.submitShipment(context.user, input);
  }
}
