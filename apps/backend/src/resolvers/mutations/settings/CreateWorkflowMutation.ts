import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Workflow } from '../../types/ProposalWorkflow';

@InputType()
export class CreateWorkflowInput implements Partial<Workflow> {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => String)
  public entityType: 'proposal' | 'experiment';
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
