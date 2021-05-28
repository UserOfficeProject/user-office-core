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
import { VisitationStatus } from '../../models/Visitation';
import { wrapResponse } from '../wrapResponse';
import { VisitationResponseWrap } from './../types/CommonWrappers';

@ArgsType()
export class UpdateVisitationArgs {
  @Field(() => Int)
  visitationId: number;

  @Field(() => VisitationStatus, { nullable: true })
  status?: VisitationStatus;

  @Field(() => Int, { nullable: true })
  proposalId?: number;

  @Field(() => [Int!], { nullable: true })
  team?: number[];
}

@Resolver()
export class UpdateVisitationMutation {
  @Mutation(() => VisitationResponseWrap)
  updateVisitation(
    @Args() args: UpdateVisitationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visitation.updateVisitation(context.user, args),
      VisitationResponseWrap
    );
  }
}
