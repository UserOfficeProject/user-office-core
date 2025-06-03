import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Facility as FacilityBase } from '../../models/Facility';
import { Call } from './Call';
import { Instrument } from './Instrument';

@ObjectType()
export class Facility implements FacilityBase {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;
}

@Resolver(() => Facility)
export class FacilityResolver {
  @FieldResolver(() => [Instrument])
  async instruments(
    @Root() facility: Facility,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.facility.dataSource.getFacilityInstruments(
      facility.id
    );
  }

  @FieldResolver(() => [Call])
  async calls(@Root() facility: Facility, @Ctx() context: ResolverContext) {
    return context.queries.facility.dataSource.getFacilityCalls(facility.id);
  }
}
