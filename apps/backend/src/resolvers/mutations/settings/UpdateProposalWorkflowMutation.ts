import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
  InputType,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflow } from '../../types/ProposalWorkflow';

@InputType()
export class UpdateProposalWorkflowInput implements ProposalWorkflow {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class UpdateProposalWorkflowMutation {
  @Mutation(() => ProposalWorkflow)
  async updateProposalWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('updatedProposalWorkflowInput')
    updatedProposalWorkflowInput: UpdateProposalWorkflowInput
  ) {
    return context.mutations.proposalSettings.updateProposalWorkflow(
      context.user,
      updatedProposalWorkflowInput
    );
  }
}
