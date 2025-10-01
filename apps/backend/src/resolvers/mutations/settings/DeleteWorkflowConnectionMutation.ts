import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowConnection } from '../../types/WorkflowConnection';

@Resolver()
export class DeleteWorkflowConnectionMutation {
  @Mutation(() => WorkflowConnection, { nullable: true })
  async deleteWorkflowConnection(
    @Arg('connectionId', () => Int) connectionId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.deleteWorkflowConnection(
      context.user,
      connectionId
    );
  }
}
