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
import {
  StatusAction as ProposalStatusActionOrigin,
  StatusActionType,
} from '../../models/StatusAction';
import {
  EmailActionDefaultConfig,
  ProposalStatusActionDefaultConfig,
  RabbitMQActionDefaultConfig,
} from './ProposalStatusActionConfig';

@ObjectType()
export class ProposalStatusAction
  implements Partial<ProposalStatusActionOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => StatusActionType)
  public type: StatusActionType;
}

@Resolver(() => ProposalStatusAction)
export class ProposalStatusActionResolver {
  @FieldResolver(() => ProposalStatusActionDefaultConfig)
  async defaultConfig(
    @Root() statusAction: ProposalStatusAction,
    @Ctx() context: ResolverContext
  ): Promise<EmailActionDefaultConfig | RabbitMQActionDefaultConfig | null> {
    return context.queries.statusAction.getStatusActionConfig(
      context.user,
      statusAction
    );
  }
}
