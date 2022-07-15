import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PredefinedMessageKey } from '../../models/PredefinedMessage';
import { PredefinedMessage } from '../types/PredefinedMessage';

@InputType()
export class PredefinedMessagesFilter {
  @Field(() => PredefinedMessageKey, { nullable: true })
  public key?: PredefinedMessageKey;
}
@Resolver()
export class PredefinedMessageQuery {
  @Query(() => [PredefinedMessage])
  predefinedMessages(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => PredefinedMessagesFilter, { nullable: true })
    filter: PredefinedMessagesFilter
  ) {
    return context.queries.predefinedMessage.getAll(context.user, filter);
  }

  @Query(() => PredefinedMessage, { nullable: true })
  predefinedMessage(
    @Arg('predefinedMessageId', () => Int) predefinedMessageId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.predefinedMessage.get(
      context.user,
      predefinedMessageId
    );
  }
}
