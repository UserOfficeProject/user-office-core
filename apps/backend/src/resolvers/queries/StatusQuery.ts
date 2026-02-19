import { Query, Ctx, Resolver, ArgsType, Field, Args, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { WorkflowType } from '../../models/Workflow';
import { Status } from '../types/Status';
import { WorkflowStatus } from '../types/WorkflowStatus';

@ArgsType()
export class StatusArgs {
  @Field(() => String!)
  statusId: string;
}

@ArgsType()
export class StatusesArgs {
  @Field(() => WorkflowType!)
  entityType: WorkflowType;
}

@ArgsType()
export class WorkflowStatusArgs {
  @Field(() => Int!)
  id: number;
}

@ArgsType()
export class WorkflowStatusesArgs {
  @Field(() => Int!)
  workflowId: number;
}

@Resolver()
export class StatusQuery {
  @Query(() => Status, { nullable: true })
  status(@Args() args: StatusArgs, @Ctx() context: ResolverContext) {
    return context.queries.status.getStatus(context.user, args.statusId);
  }

  @Query(() => [Status])
  statuses(@Args() args: StatusesArgs, @Ctx() context: ResolverContext) {
    return context.queries.status.getAllStatuses(context.user, args.entityType);
  }

  @Query(() => WorkflowStatus, { nullable: true })
  workflowStatus(
    @Args() args: WorkflowStatusArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.workflow.getWorkflowStatus(context.user, args.id);
  }

  @Query(() => [WorkflowStatus])
  workflowStatuses(
    @Args() args: WorkflowStatusesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.workflow.getWorkflowStatuses(
      context.user,
      args.workflowId
    );
  }
}
