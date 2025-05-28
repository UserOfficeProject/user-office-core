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
export class AssignUsersToFacilityArgs {
  @Field(() => [Int])
  public userIds: number[];

  @Field(() => Int)
  public facilityId: number;
}

@ArgsType()
export class RemoveScientistFromFacilityArgs {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public facilityId: number;
}

@Resolver()
export class AssignScientistsToFacilityMutation {
  @Mutation(() => Boolean)
  async assignUsersToFacility(
    @Args() args: AssignUsersToFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.addUserToFacility(context.user, args);
  }

  @Mutation(() => Boolean)
  async removeUserFromFacility(
    @Args() args: RemoveScientistFromFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.removeUserFromFacility(
      context.user,
      args
    );
  }
}
