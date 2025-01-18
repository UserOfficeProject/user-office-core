import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Workflow } from '../../types/ProposalWorkflow';

@Resolver()
export class DeleteWorkflowMutation {
  @Mutation(() => Workflow)
  async deleteWorkflow(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.deleteWorkflow(context.user, {
      id,
    });
  }
}
