import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  InputType,
  Arg,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import {
  ConnectionHasStatusAction,
  StatusActionType,
} from '../../../models/ProposalStatusAction';
import { ConnectionStatusAction } from '../../types/ConnectionStatusAction';

@InputType()
export class ConnectionHasActionsInput {
  @Field(() => Int)
  public actionId: number;

  @Field(() => StatusActionType)
  public actionType: StatusActionType;

  @Field(() => String, { nullable: true })
  public config: string;
}

@InputType()
export class AddConnectionStatusActionsInput
  implements Partial<ConnectionHasStatusAction>
{
  @Field(() => Int)
  public connectionId: number;

  @Field(() => Int)
  public workflowId: number;

  @Field(() => [ConnectionHasActionsInput])
  public actions: ConnectionHasActionsInput[];
}

@Resolver()
export class AddConnectionStatusActionsMutation {
  @Mutation(() => [ConnectionStatusAction], { nullable: true })
  async addConnectionStatusActions(
    @Ctx() context: ResolverContext,
    @Arg('newConnectionStatusActionsInput')
    newConnectionStatusActionsInput: AddConnectionStatusActionsInput
  ) {
    return context.mutations.proposalSettings.addConnectionStatusActions(
      context.user,
      newConnectionStatusActionsInput
    );
  }
}
