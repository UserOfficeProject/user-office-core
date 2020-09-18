import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflow } from '../../../models/ProposalWorkflow';
import { ProposalWorkflowResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class CreateProposalWorkflowInput implements Partial<ProposalWorkflow> {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflowResponseWrap)
  async createProposalWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('newProposalWorkflowInput')
    newProposalWorkflowInput: CreateProposalWorkflowInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.createProposalWorkflow(
        context.user,
        newProposalWorkflowInput
      ),
      ProposalWorkflowResponseWrap
    );
  }
}
