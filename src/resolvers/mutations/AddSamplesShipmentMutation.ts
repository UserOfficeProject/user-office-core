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
export class AddSamplesToShipmentArgs {
  @Field(() => Int)
  public shipmentId: number;

  @Field(() => [Int])
  public sampleIds: number[];
}

@Resolver()
export class AddSamplesToShipmentMutation {
  @Mutation(() => ShipmentResponseWrap)
  addSamplesToShipment(
    @Args() args: AddSamplesToShipmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.shipment.addSamples(context.user, args),
      ShipmentResponseWrap
    );
  }
}
