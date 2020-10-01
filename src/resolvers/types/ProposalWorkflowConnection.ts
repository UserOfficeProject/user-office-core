import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalWorkflowConnection as ProposalWorkflowConnectionOrigin } from '../../models/ProposalWorkflowConnections';
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
  public nextStatusEventType: string;

  @Field()
  public droppableGroupId: string;
}

@ObjectType()
export class ProposalWorkflowConnectionGroup {
  @Field(() => String)
  public groupId: string;

  @Field(() => String, { nullable: true })
  public previousGroupId: string | null;

  @Field(() => [ProposalWorkflowConnection])
  public connections: ProposalWorkflowConnection[];
}
