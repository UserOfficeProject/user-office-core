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
import { ProposalWorkflowConnection as ProposalWorkflowConnectionOrigin } from '../../models/ProposalWorkflowConnections';
import { isRejection } from '../../models/Rejection';
import { ConnectionStatusAction } from './ConnectionStatusAction';
import { ProposalStatus } from './ProposalStatus';
import { StatusChangingEvent } from './StatusChangingEvent';

@ObjectType()
export class ProposalWorkflowConnection
  implements Partial<ProposalWorkflowConnectionOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Int)
  public statusId: number;

  @Field(() => ProposalStatus)
  public status: ProposalStatus;

  @Field(() => Int, { nullable: true })
  public nextStatusId: number | null;

  @Field(() => Int, { nullable: true })
  public prevStatusId: number | null;

  @Field()
  public droppableGroupId: string;
}

@ObjectType()
export class ProposalWorkflowConnectionGroup {
  @Field(() => String)
  public groupId: string;

  @Field(() => String, { nullable: true })
  public parentGroupId: string | null;

  @Field(() => [ProposalWorkflowConnection])
  public connections: ProposalWorkflowConnection[];
}

@Resolver(() => ProposalWorkflowConnection)
export class ProposalWorkflowConnectionResolver {
  @FieldResolver(() => [StatusChangingEvent], { nullable: true })
  async statusChangingEvents(
    @Root() proposalWorkflowConnection: ProposalWorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<StatusChangingEvent[]> {
    const statusChangingEvents =
      await context.queries.proposalSettings.getStatusChangingEventsByConnectionId(
        context.user,
        proposalWorkflowConnection.id
      );

    return isRejection(statusChangingEvents) ? [] : statusChangingEvents;
  }

  @FieldResolver(() => [ConnectionStatusAction], { nullable: true })
  async statusActions(
    @Root() proposalWorkflowConnection: ProposalWorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<ConnectionStatusAction[]> {
    const statusActions =
      await context.queries.proposalSettings.getConnectionStatusActions(
        context.user,
        {
          connectionId: proposalWorkflowConnection.id,
          workflowId: proposalWorkflowConnection.proposalWorkflowId,
        }
      );

    return isRejection(statusActions) ? [] : statusActions;
  }
}
