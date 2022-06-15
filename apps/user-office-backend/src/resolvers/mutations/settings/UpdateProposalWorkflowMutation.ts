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
import { ProposalWorkflow } from '../../../models/ProposalWorkflow';
import { ProposalWorkflowResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

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
  @Mutation(() => ProposalWorkflowResponseWrap)
  async updateProposalWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('updatedProposalWorkflowInput')
    updatedProposalWorkflowInput: UpdateProposalWorkflowInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.updateProposalWorkflow(
        context.user,
        updatedProposalWorkflowInput
      ),
      ProposalWorkflowResponseWrap
    );
  }
}
