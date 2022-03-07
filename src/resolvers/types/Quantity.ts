import { Field, ObjectType } from 'type-graphql';

import { Quantity as QuantityOrigin } from '../../models/Quantity';

@ObjectType()
export class Quantity implements Partial<QuantityOrigin> {
  @Field(() => String)
  id: string;
}
