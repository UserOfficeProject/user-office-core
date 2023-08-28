import { Field, Int, ObjectType } from 'type-graphql';

import { ConnectionHasStatusAction } from '../../models/ProposalStatusAction';
import { ProposalStatusActionConfig } from './ProposalStatusActionConfig';

@ObjectType()
export class ConnectionStatusAction
  implements Partial<ConnectionHasStatusAction>
{
  @Field(() => Int)
  public connectionId: number;

  @Field(() => Int)
  public actionId: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => Boolean)
  public executed: boolean;

  @Field(() => ProposalStatusActionConfig)
  public config: typeof ProposalStatusActionConfig;
}
