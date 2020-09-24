import {
  ObjectType,
  Field,
  Int,
  Resolver,
  Root,
  FieldResolver,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalWorkflow as ProposalWorkflowOrigin } from '../../models/ProposalWorkflow';
import { isRejection } from '../../rejection';
import { ProposalWorkflowConnection } from './ProposalWorkflowConnection';

@ObjectType()
export class ProposalWorkflow implements Partial<ProposalWorkflowOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}

@Resolver(() => ProposalWorkflow)
export class ProposalWorkflowResolver {
  @FieldResolver(() => [ProposalWorkflowConnection])
  async proposalWorkflowConnections(
    @Root() proposalWorkflow: ProposalWorkflow,
    @Ctx() context: ResolverContext
  ): Promise<ProposalWorkflowConnection[]> {
    const connections = await context.queries.proposalSettings.getProposalWorkflowConnections(
      context.user,
      proposalWorkflow.id
    );

    return isRejection(connections) ? [] : connections;
  }
}
