import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflow } from '../../types/ProposalWorkflow';

@InputType()
export class CreateProposalWorkflowInput implements Partial<ProposalWorkflow> {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflow)
  async createProposalWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('newProposalWorkflowInput')
    newProposalWorkflowInput: CreateProposalWorkflowInput
  ) {
    return context.mutations.proposalSettings.createProposalWorkflow(
      context.user,
      newProposalWorkflowInput
    );
  }
}
