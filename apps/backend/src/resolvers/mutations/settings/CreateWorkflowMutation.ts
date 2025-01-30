import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowType } from '../../../models/Workflow';
import { Workflow } from '../../types/Workflow';

@InputType()
export class CreateWorkflowInput implements Partial<Workflow> {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => WorkflowType)
  public entityType: WorkflowType;
}

@Resolver()
export class CreateWorkflowMutation {
  @Mutation(() => Workflow)
  async createWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('newWorkflowInput')
    newWorkflowInput: CreateWorkflowInput
  ) {
    return context.mutations.workflow.createWorkflow(
      context.user,
      newWorkflowInput
    );
  }
}
