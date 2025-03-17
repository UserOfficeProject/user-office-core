import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Facility } from '../types/Facility';

@ArgsType()
export class CreateFacilityArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;
}

@Resolver()
export class CreateFacilityMutation {
  @Mutation(() => Facility)
  async createFacility(
    @Args() args: CreateFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.createFacility(context.user, args);
  }
}
