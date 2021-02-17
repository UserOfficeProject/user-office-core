import { Field, Int, ObjectType } from 'type-graphql';

import { Unit as UnitOrigin } from '../../models/Unit';

@ObjectType()
export class Unit implements Partial<UnitOrigin> {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
