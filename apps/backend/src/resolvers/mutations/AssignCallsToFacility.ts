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
export class AssignCallsToFacilityArgs {
  @Field(() => [Int])
  public callIds: number[];

  @Field(() => Int)
  public facilityId: number;
}

@ArgsType()
export class RemoveCallFromFacilityArgs {
  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public facilityId: number;
}

@Resolver()
export class AssignCallsToFacilityMutation {
  @Mutation(() => Boolean)
  async assignCallsToFacility(
    @Args() args: AssignCallsToFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.addCallsToFacility(context.user, args);
  }

  @Mutation(() => Boolean)
  async removeCallFromFacility(
    @Args() args: RemoveCallFromFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.removeCallFromFacility(
      context.user,
      args
    );
  }
}
