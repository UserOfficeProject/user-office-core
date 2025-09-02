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
import { WorkflowStatus } from '../../types/WorkflowStatus';

@ArgsType()
export class AddStatusToWorkflowArgs {
  @Field(() => Int)
  workflowId: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int)
  posX: number;

  @Field(() => Int)
  posY: number;
}

@Resolver()
export class AddStatusToWorkflowMutation {
  @Mutation(() => WorkflowStatus)
  addStatusToWorkflow(
    @Args() args: AddStatusToWorkflowArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.addStatusToWorkflow(context.user, args);
  }
}
