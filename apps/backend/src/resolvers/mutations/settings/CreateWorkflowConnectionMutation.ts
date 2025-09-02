import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { WorkflowConnection } from '../../types/WorkflowConnection';
@ArgsType()
export class CreateWorkflowConnectionArgs {
  @Field(() => Int)
  workflowId: number;

  @Field(() => Int)
  nextWorkflowStatusId: number;

  @Field(() => Int)
  prevWorkflowStatusId: number;
}

@Resolver()
export class CreateWorkflowConnectionMutationn {
  @Mutation(() => WorkflowConnection)
  createWorkflowConnection(
    @Args() args: CreateWorkflowConnectionArgs,
    @Ctx() context: ResolverContext
  ) {

    return context.mutations.workflow.createWorkflowConnection(
      context.user,
      args
    );
  }
}
