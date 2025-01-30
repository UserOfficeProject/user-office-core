import { Query, Ctx, Resolver, Int, ArgsType, Field, Args } from 'type-graphql';

import { ResolverContext } from '../../context';
import { WorkflowType } from '../../models/Workflow';
import { Workflow, WorkflowEvent } from '../types/Workflow';

@ArgsType()
export class WorkflowArgs {
  @Field(() => Int)
  workflowId: number;
}

@ArgsType()
export class WorkflowsArgs {
  @Field(() => WorkflowType)
  entityType: WorkflowType;
}

@Resolver()
export class WorkflowQuery {
  @Query(() => Workflow, { nullable: true })
  workflow(@Args() args: WorkflowArgs, @Ctx() context: ResolverContext) {
    return context.queries.workflow.getWorkflow(context.user, args.workflowId);
  }

  @Query(() => [Workflow], { nullable: true })
  workflows(@Args() args: WorkflowsArgs, @Ctx() context: ResolverContext) {
    return context.queries.workflow.getAllWorkflows(
      context.user,
      args.entityType
    );
  }

  @Query(() => [WorkflowEvent], {
    nullable: true,
  })
  events(@Args() args: WorkflowsArgs, @Ctx() context: ResolverContext) {
    return context.queries.settings.getAllEvents(context.user, args.entityType);
  }
}
