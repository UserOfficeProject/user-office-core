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

@InputType()
export class DeleteWorkflowStatusInput {
  @Field(() => Int)
  public statusId: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public sortOrder: number;
}

@Resolver()
export class DeleteWorkflowStatusMutation {
  @Mutation(() => Boolean)
  async deleteWorkflowStatus(
    @Ctx() context: ResolverContext,
    @Arg('deleteWorkflowStatusInput')
    deleteWorkflowStatusInput: DeleteWorkflowStatusInput
  ) {
    return context.mutations.workflow.deleteWorkflowStatus(
      context.user,
      deleteWorkflowStatusInput
    );
  }
}
