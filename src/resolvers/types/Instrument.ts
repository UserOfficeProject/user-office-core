import { ObjectType, Field, Int } from 'type-graphql';

import { Instrument as InstrumentOrigin } from '../../models/Instrument';

@ObjectType()
export class Instrument implements Partial<InstrumentOrigin> {
  @Field(() => Int)
  public instrumentId: number;

  @Field()
  public name: string;

  @Field()
  public shortCode: string;

  @Field()
  public description: string;
}
