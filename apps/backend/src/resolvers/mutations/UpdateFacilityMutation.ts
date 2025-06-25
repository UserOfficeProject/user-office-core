import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Facility } from '../types/Facility';
import { CreateFacilityArgs } from './CreateFacilityMutation';

@ArgsType()
export class UpdateFacilityArgs extends CreateFacilityArgs {
  @Field(() => Int)
  public id: number;
}

@Resolver()
export class CreateFacilityMutation {
  @Mutation(() => Facility)
  async updateFacility(
    @Args() args: UpdateFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.facility.updateFacility(context.user, args);
  }
}
