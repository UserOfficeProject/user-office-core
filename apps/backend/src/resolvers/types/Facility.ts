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
import { BasicUserDetails } from './BasicUserDetails';
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
  @FieldResolver(() => [BasicUserDetails])
  async users(@Root() facility: Facility, @Ctx() context: ResolverContext) {
    return context.queries.facility.dataSource.getFacilityUsers(facility.id);
  }

  @FieldResolver(() => [Instrument])
  async instruments(
    @Root() facility: Facility,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.facility.dataSource.getFacilityInstruments(
      facility.id
    );
  }
}
