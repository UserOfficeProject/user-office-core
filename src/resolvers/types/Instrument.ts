import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Instrument as InstrumentOrigin } from '../../models/Instrument';
import { isRejection } from '../../rejection';
import { BasicUserDetails } from './BasicUserDetails';

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

@ObjectType()
export class InstrumentWithAvailabilityTime extends Instrument {
  @Field(() => Int, { nullable: true })
  public availabilityTime: number;
}

@Resolver(() => Instrument)
export class InstrumentResolver {
  @FieldResolver(() => [BasicUserDetails])
  async scientists(
    @Root() instrument: Instrument,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[] | null> {
    const scientists = context.queries.instrument.dataSource.getInstrumentScientists(
      instrument.instrumentId
    );

    return isRejection(scientists) ? [] : scientists;
  }
}
