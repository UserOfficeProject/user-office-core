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
  StatusAction as StatusActionOrigin,
  StatusActionType,
} from '../../models/StatusAction';
import {
  EmailActionDefaultConfig,
  StatusActionDefaultConfig,
  RabbitMQActionDefaultConfig,
} from './StatusActionConfig';

@ObjectType()
export class StatusAction implements Partial<StatusActionOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => StatusActionType)
  public type: StatusActionType;
}

@Resolver(() => StatusAction)
export class StatusActionResolver {
  @FieldResolver(() => StatusActionDefaultConfig)
  async defaultConfig(
    @Root() statusAction: StatusAction,
    @Ctx() context: ResolverContext
  ): Promise<EmailActionDefaultConfig | RabbitMQActionDefaultConfig | null> {
    return context.queries.statusAction.getStatusActionConfig(
      context.user,
      statusAction
    );
  }
}
