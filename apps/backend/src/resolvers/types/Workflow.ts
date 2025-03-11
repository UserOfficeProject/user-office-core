import {
  ObjectType,
  Field,
  Int,
  Resolver,
  Root,
  FieldResolver,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';
import { isRejection } from '../../models/Rejection';
import {
  Workflow as WorkflowOrigin,
  WorkflowType,
} from '../../models/Workflow';
import { WorkflowConnectionGroup } from './WorkflowConnection';

@ObjectType()
export class Workflow implements Partial<WorkflowOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => WorkflowType)
  public entityType: WorkflowType;
}

@Resolver(() => Workflow)
export class WorkflowResolver {
  @FieldResolver(() => [WorkflowConnectionGroup])
  async workflowConnectionGroups(
    @Root() workflow: Workflow,
    @Ctx() context: ResolverContext
  ): Promise<WorkflowConnectionGroup[]> {
    const connections = await context.queries.workflow.workflowConnectionGroups(
      context.user,
      workflow.id
    );

    return isRejection(connections) ? [] : connections;
  }
}
@ObjectType()
export class WorkflowEvent {
  @Field(() => Event)
  public name: Event;

  @Field(() => String, { nullable: true })
  public description: string;
}
