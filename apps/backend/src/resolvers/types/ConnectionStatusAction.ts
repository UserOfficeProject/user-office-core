import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ConnectionHasStatusAction } from '../../models/StatusAction';
import { ProposalStatusAction } from './ProposalStatusAction';
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

  @Field(() => ProposalStatusActionConfig, { nullable: true })
  public config: typeof ProposalStatusActionConfig | null;
}

@Resolver(() => ConnectionStatusAction)
export class ConnectionStatusActionResolver {
  @FieldResolver(() => ProposalStatusAction)
  async action(
    @Root() connectionStatusAction: ConnectionStatusAction,
    @Ctx() context: ResolverContext
  ): Promise<ProposalStatusAction> {
    return context.queries.statusAction.getStatusAction(
      context.user,
      connectionStatusAction.actionId
    );
  }
}
