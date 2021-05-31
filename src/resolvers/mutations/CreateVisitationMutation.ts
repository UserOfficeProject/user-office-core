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
import { VisitationResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateVisitationArgs {
  @Field(() => Int)
  proposalId: number;

  @Field(() => [Int], { nullable: true })
  team?: number[];
}

@Resolver()
export class CreateVisitationMutation {
  @Mutation(() => VisitationResponseWrap)
  createVisitation(
    @Args() args: CreateVisitationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visitation.createVisitation(context.user, args),
      VisitationResponseWrap
    );
  }
}
