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
import { isRejection } from '../../rejection';
import { SEPResponseWrap, SuccessResponseWrap } from '../types/CommonWrappers';
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
  @Mutation(() => SuccessResponseWrap)
  async assignProposalToSEP(
    @Args() args: AssignProposalToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.sep.assignProposalToSEP(
      context.user,
      args
    );

    return wrapResponse(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(true),
      SuccessResponseWrap
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
