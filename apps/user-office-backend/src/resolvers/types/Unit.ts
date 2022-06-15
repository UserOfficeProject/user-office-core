import { Field, ObjectType } from 'type-graphql';

import { Unit as UnitOrigin } from '../../models/Unit';

@ObjectType()
export class Unit implements Partial<UnitOrigin> {
  @Field()
  id: string;

  @Field()
  unit: string;

  @Field()
  quantity: string;

  @Field()
  symbol: string;

  @Field()
  siConversionFormula: string;
}
