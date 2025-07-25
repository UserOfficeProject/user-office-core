import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
  InputType,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Workflow } from '../../types/Workflow';

@InputType()
export class UpdateWorkflowInput {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => String, { nullable: true })
  public connectionLineType?: string;
}

@Resolver()
export class UpdateWorkflowMutation {
  @Mutation(() => Workflow)
  async updateWorkflow(
    @Ctx() context: ResolverContext,
    @Arg('updatedWorkflowInput')
    updatedWorkflowInput: UpdateWorkflowInput
  ) {
    return context.mutations.workflow.updateWorkflow(
      context.user,
      updatedWorkflowInput
    );
  }
}
