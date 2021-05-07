import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  InputType,
  Arg,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { SuccessResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class DeleteProposalWorkflowStatusInput {
  @Field(() => Int)
  public proposalStatusId: number;

  @Field(() => Int)
  public proposalWorkflowId: number;

  @Field(() => Int)
  public sortOrder: number;
}

@Resolver()
export class DeleteProposalWorkflowStatusMutation {
  @Mutation(() => SuccessResponseWrap)
  async deleteProposalWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('deleteProposalWorkflowStatusInput')
    deleteProposalWorkflowStatusInput: DeleteProposalWorkflowStatusInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.deleteProposalWorkflowStatus(
        context.user,
        deleteProposalWorkflowStatusInput
      ),
      SuccessResponseWrap
    );
  }
}
