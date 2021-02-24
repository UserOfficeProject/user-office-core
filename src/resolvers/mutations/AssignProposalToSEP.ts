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
import {
  NextProposalStatusResponseWrap,
  SEPResponseWrap,
} from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AssignProposalToSEPArgs {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => Int)
  public sepId: number;
}

@Resolver()
export class AssignProposalToSEPMutation {
  @Mutation(() => NextProposalStatusResponseWrap)
  async assignProposalToSEP(
    @Args() args: AssignProposalToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignProposalToSEP(context.user, args),
      NextProposalStatusResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeProposalAssignment(
    @Args() args: AssignProposalToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeProposalAssignment(context.user, args),
      SEPResponseWrap
    );
  }
}
