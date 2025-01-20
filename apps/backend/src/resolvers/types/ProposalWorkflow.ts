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
import {
  ProposalWorkflow as ProposalWorkflowOrigin,
  Workflow as WorkflowOrigin,
} from '../../models/ProposalWorkflow';
import { isRejection } from '../../models/Rejection';
import { ProposalWorkflowConnectionGroup } from './ProposalWorkflowConnection';

@ObjectType()
export class Workflow implements Partial<WorkflowOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => String)
  public entityType: 'proposal' | 'experiment';
}
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
  @FieldResolver(() => [ProposalWorkflowConnectionGroup])
  async proposalWorkflowConnectionGroups(
    @Root() proposalWorkflow: ProposalWorkflow,
    @Ctx() context: ResolverContext
  ): Promise<ProposalWorkflowConnectionGroup[]> {
    const connections = await context.queries.workflow.workflowConnectionGroups(
      context.user,
      proposalWorkflow.id,
      'proposal'
    );

    return isRejection(connections) ? [] : connections;
  }
}
