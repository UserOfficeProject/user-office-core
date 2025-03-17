import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class AssignInstrumentsToFacilityArgs {
  @Field(() => [Int])
  public instrumentIds: number[];

  @Field(() => Int)
  public facilityId: number;
}

@ArgsType()
export class RemoveInstrumentFromFacilityArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public facilityId: number;
}

@Resolver()
export class AssignInstrumentsToFacilityMutation {
  @Mutation(() => Boolean)
  async assignInstrumentsToFacility(
    @Args() args: AssignInstrumentsToFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.addInstrumentsToFacility(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async removeInstrumentFromFacility(
    @Args() args: RemoveInstrumentFromFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.removeInstrumentFromFacility(
      context.user,
      args
    );
  }
}
