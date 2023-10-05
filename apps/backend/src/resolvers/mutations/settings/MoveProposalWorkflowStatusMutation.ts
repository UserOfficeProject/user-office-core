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
import { ProposalWorkflowConnection } from '../../types/ProposalWorkflowConnection';

@InputType()
export class IndexWithGroupId {
  @Field(() => Int)
  public index: number;

  @Field(() => String)
  public droppableId: string;
}

@InputType()
export class MoveProposalWorkflowStatusInput {
  @Field(() => IndexWithGroupId)
  public from: IndexWithGroupId;

  @Field(() => IndexWithGroupId)
  public to: IndexWithGroupId;

  @Field(() => Int)
  public proposalWorkflowId: number;
}

@Resolver()
export class MoveProposalWorkflowStatusMutation {
  @Mutation(() => ProposalWorkflowConnection)
  async moveProposalWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('moveProposalWorkflowStatusInput')
    moveProposalWorkflowStatusInput: MoveProposalWorkflowStatusInput
  ) {
    return context.mutations.proposalSettings.moveProposalWorkflowStatus(
      context.user,
      moveProposalWorkflowStatusInput
    );
  }
}
