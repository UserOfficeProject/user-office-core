import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PredefinedMessage } from '../types/PredefinedMessage';

@Resolver()
export class PredefinedMessageQuery {
  @Query(() => [PredefinedMessage])
  predefinedMessages(@Ctx() context: ResolverContext) {
    return context.queries.predefinedMessage.getAll(context.user);
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
