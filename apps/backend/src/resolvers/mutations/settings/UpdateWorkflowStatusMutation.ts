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
export class UpdateWorkflowStatusArgs {
  @Field(() => Int)
  workflowStatusId: number;

  @Field(() => Int, { nullable: true })
  posX?: number;

  @Field(() => Int, { nullable: true })
  posY?: number;
}

@Resolver()
export class UpdateWorkflowStatusMutation {
  @Mutation(() => WorkflowStatus)
  updateWorkflowStatus(
    @Args() args: UpdateWorkflowStatusArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.workflow.updateWorkflowStatus(context.user, args);
  }
}
