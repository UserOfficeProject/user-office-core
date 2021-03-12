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
import { isRejection } from '../../rejection';
import { NextStatusEvent } from './NextStatusEvent';
import { ProposalStatus } from './ProposalStatus';

@ObjectType()
export class ProposalWorkflowConnection
  implements Partial<ProposalWorkflowConnectionOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => Int)
  public proposalWorkflowId: number;

  @Field(() => Int)
  public proposalStatusId: number;

  @Field(() => ProposalStatus)
  public proposalStatus: ProposalStatus;

  @Field(() => Int, { nullable: true })
  public nextProposalStatusId: number | null;

  @Field(() => Int, { nullable: true })
  public prevProposalStatusId: number | null;

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
  @FieldResolver(() => [NextStatusEvent])
  async nextStatusEvents(
    @Root() proposalWorkflowConnection: ProposalWorkflowConnection,
    @Ctx() context: ResolverContext
  ): Promise<NextStatusEvent[]> {
    const nextStatusEvents = await context.queries.proposalSettings.getNextStatusEventsByConnectionId(
      context.user,
      proposalWorkflowConnection.id
    );

    return isRejection(nextStatusEvents) ? [] : nextStatusEvents;
  }
}
