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
export class AddSamplesToShipmentArgs {
  @Field(() => Int)
  public shipmentId: number;

  @Field(() => [Int])
  public sampleIds: number[];
}

@Resolver()
export class AddSamplesToShipmentMutation {
  @Mutation(() => Shipment)
  addSamplesToShipment(
    @Args() args: AddSamplesToShipmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.shipment.addSamples(context.user, args);
  }
}
