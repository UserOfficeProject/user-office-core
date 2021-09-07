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
import { ProposalWorkflowConnection } from '../../../models/ProposalWorkflowConnections';
import { ProposalWorkflowConnectionResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class AddProposalWorkflowStatusInput
  implements Partial<ProposalWorkflowConnection>
{
  @Field(() => Int)
  public proposalWorkflowId: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => String)
  public droppableGroupId: string;

  @Field(() => String, { nullable: true })
  public parentDroppableGroupId: string | null;

  @Field(() => Int)
  public proposalStatusId: number;

  @Field(() => Int, { nullable: true })
  public nextProposalStatusId: number | null;

  @Field(() => Int, { nullable: true })
  public prevProposalStatusId: number | null;
}

@Resolver()
export class AddProposalWorkflowStatusMutation {
  @Mutation(() => ProposalWorkflowConnectionResponseWrap)
  async addProposalWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('newProposalWorkflowStatusInput')
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.addProposalWorkflowStatus(
        context.user,
        newProposalWorkflowStatusInput
      ),
      ProposalWorkflowConnectionResponseWrap
    );
  }
}
