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
import { WorkflowConnectionGroup } from './ProposalWorkflowConnection';

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
@Resolver(() => Workflow)
export class WorkflowResolver {
  @FieldResolver(() => [WorkflowConnectionGroup])
  async workflowConnectionGroups(
    @Root() workflow: Workflow,
    @Ctx() context: ResolverContext
  ): Promise<WorkflowConnectionGroup[]> {
    const connections = await context.queries.workflow.workflowConnectionGroups(
      context.user,
      workflow.id,
      'proposal'
    );

    return isRejection(connections) ? [] : connections;
  }
}
