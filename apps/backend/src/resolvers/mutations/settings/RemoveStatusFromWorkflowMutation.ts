import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowStatus } from '../../types/WorkflowStatus';

@Resolver()
export class RemoveStatusFromWorkflowMutation {
  @Mutation(() => WorkflowStatus)
  removeStatusFromWorkflow(
    @Arg('workflowStatusId', () => Int) workflowStatusId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.removeStatusFromWorkflow(
      context.user,
      workflowStatusId
    );
  }
}
