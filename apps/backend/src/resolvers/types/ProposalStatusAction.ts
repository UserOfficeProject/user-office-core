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
  ProposalStatusAction as ProposalStatusActionOrigin,
  ProposalStatusActionType,
} from '../../models/ProposalStatusAction';
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

  @Field(() => ProposalStatusActionType)
  public type: ProposalStatusActionType;
}

@Resolver(() => ProposalStatusAction)
export class ProposalStatusActionResolver {
  @FieldResolver(() => ProposalStatusActionDefaultConfig)
  async defaultConfig(
    @Root() statusAction: ProposalStatusAction,
    @Ctx() context: ResolverContext
  ): Promise<EmailActionDefaultConfig | RabbitMQActionDefaultConfig | null> {
    return context.queries.proposalSettings.getStatusActionConfig(
      context.user,
      statusAction
    );
  }
}
