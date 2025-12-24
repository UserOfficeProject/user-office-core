import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { WorkflowStatus as WorkflowStatusOrigin } from '../../models/WorkflowStatus';
import { Status } from './Status';

@ObjectType()
export class WorkflowStatus implements Partial<WorkflowStatusOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public statusId: number;

  @Field(() => Int)
  public posX: number;

  @Field(() => Int)
  public posY: number;
}

@Resolver(() => WorkflowStatus)
export class WorkflowStatusResolver {
  @FieldResolver(() => Status)
  async status(
    @Root() workflowStatus: WorkflowStatus,
    @Ctx() context: ResolverContext
  ): Promise<Status | null> {
    return context.queries.status.getStatus(
      context.user,
      workflowStatus.statusId
    );
  }
}
