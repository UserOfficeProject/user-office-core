import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Workflow } from '../../types/Workflow';

@Resolver()
export class CloneWorkflowMutation {
  @Mutation(() => Workflow)
  cloneWorkflow(
    @Arg('workflowId', () => Int) workflowId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.cloneWorkflow(context.user, {
      workflowId,
    });
  }
}
