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
import { StatusAction } from './StatusAction';
import { StatusActionConfig } from './StatusActionConfig';

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

  @Field(() => StatusActionConfig, { nullable: true })
  public config: typeof StatusActionConfig | null;
}

@Resolver(() => ConnectionStatusAction)
export class ConnectionStatusActionResolver {
  @FieldResolver(() => StatusAction)
  async action(
    @Root() connectionStatusAction: ConnectionStatusAction,
    @Ctx() context: ResolverContext
  ): Promise<StatusAction> {
    return context.queries.statusAction.getStatusAction(
      context.user,
      connectionStatusAction.actionId
    );
  }
}
