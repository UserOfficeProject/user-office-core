import { Query, Ctx, Resolver, Int, ArgsType, Field, Args } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Workflow } from '../types/Workflow';

@ArgsType()
export class WorkflowArgs {
  @Field(() => Int)
  workflowId: number;

  @Field(() => String)
  entityType: 'proposal' | 'experiment';
}

@ArgsType()
export class WorkflowsArgs {
  @Field(() => String)
  entityType: 'proposal' | 'experiment';
}

@Resolver()
export class WorkflowQuery {
  @Query(() => Workflow, { nullable: true })
  workflow(@Args() args: WorkflowArgs, @Ctx() context: ResolverContext) {
    return context.queries.workflow.getWorkflow(
      context.user,
      args.workflowId,
      args.entityType
    );
  }

  @Query(() => [Workflow], { nullable: true })
  workflows(@Args() args: WorkflowsArgs, @Ctx() context: ResolverContext) {
    return context.queries.workflow.getAllWorkflows(
      context.user,
      args.entityType
    );
  }
}
