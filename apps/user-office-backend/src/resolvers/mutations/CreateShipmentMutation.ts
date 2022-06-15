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
export class CreateShipmentInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => Int)
  scheduledEventId: number;
}

@Resolver()
export class CreateShipmentMutation {
  @Mutation(() => ShipmentResponseWrap)
  createShipment(
    @Args() input: CreateShipmentInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.shipment.createShipment(context.user, input),
      ShipmentResponseWrap
    );
  }
}
