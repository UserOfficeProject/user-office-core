import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitStatus } from '../../models/Visit';
import { VisitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
class ProposalPkAndEventId {
  @Field(() => Int)
  proposalPK: number;

  @Field(() => Int)
  scheduledEventId: number;
}

@ArgsType()
export class UpdateVisitArgs {
  @Field(() => Int)
  visitId: number;

  @Field(() => VisitStatus, { nullable: true })
  status?: VisitStatus;

  @Field(() => ProposalPkAndEventId, { nullable: true })
  proposalPkAndEventId?: ProposalPkAndEventId;

  @Field(() => [Int!], { nullable: true })
  team?: number[];

  @Field(() => Int, { nullable: true })
  teamLeadUserId?: number;
}

@Resolver()
export class UpdateVisitMutation {
  @Mutation(() => VisitResponseWrap)
  updateVisit(@Args() args: UpdateVisitArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.visit.updateVisit(context.user, args),
      VisitResponseWrap
    );
  }
}
