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
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateSEPArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Int, { defaultValue: 2 })
  public numberRatingsRequired: number;

  @Field(() => Boolean)
  public active: boolean;
}

@Resolver()
export class UpdateSEPMutation {
  @Mutation(() => SEPResponseWrap)
  async updateSEP(
    @Args() args: UpdateSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.update(context.user, args),
      SEPResponseWrap
    );
  }
}
