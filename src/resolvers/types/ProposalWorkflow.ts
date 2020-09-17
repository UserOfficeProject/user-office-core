import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalWorkflow as ProposalWorkflowOrigin } from '../../models/ProposalWorkflow';

@ObjectType()
export class ProposalWorkflow implements Partial<ProposalWorkflowOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;
}
