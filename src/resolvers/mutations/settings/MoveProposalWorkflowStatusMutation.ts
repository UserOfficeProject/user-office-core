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
import { ProposalWorkflowConnectionResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class MoveProposalWorkflowStatusInput {
  @Field(() => Int)
  public from: number;

  @Field(() => Int)
  public to: number;

  @Field(() => Int)
  public proposalWorkflowId: number;
}

@Resolver()
export class MoveProposalWorkflowStatusMutation {
  @Mutation(() => ProposalWorkflowConnectionResponseWrap)
  async moveProposalWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('moveProposalWorkflowStatusInput')
    moveProposalWorkflowStatusInput: MoveProposalWorkflowStatusInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.moveProposalWorkflowStatus(
        context.user,
        moveProposalWorkflowStatusInput
      ),
      ProposalWorkflowConnectionResponseWrap
    );
  }
}
