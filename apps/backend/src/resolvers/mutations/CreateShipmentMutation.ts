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
export class CreateShipmentInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  proposalPk: number;

  @Field(() => Int)
  experimentPk: number;
}

@Resolver()
export class CreateShipmentMutation {
  @Mutation(() => Shipment)
  createShipment(
    @Args() input: CreateShipmentInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.shipment.createShipment(context.user, input);
  }
}
