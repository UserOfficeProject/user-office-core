import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalWorkflowResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@ArgsType()
export class UpdateProposalWorkflowArgs {
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
    @Args() args: UpdateProposalWorkflowArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.updateProposalWorkflow(
        context.user,
        args
      ),
      ProposalWorkflowResponseWrap
    );
  }
}
