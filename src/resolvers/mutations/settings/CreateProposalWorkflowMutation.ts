import { Args, ArgsType, Ctx, Mutation, Resolver, Field } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflowResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@ArgsType()
export class CreateProposalWorkflowArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflowResponseWrap)
  async createProposalWorkflow(
    @Args() args: CreateProposalWorkflowArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.createProposalWorkflow(
        context.user,
        args
      ),
      ProposalWorkflowResponseWrap
    );
  }
}
