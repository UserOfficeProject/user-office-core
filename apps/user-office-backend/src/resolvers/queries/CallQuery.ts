import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call } from '../types/Call';

@Resolver()
export class CallQuery {
  @Query(() => Call, { nullable: true })
  call(
    @Arg('callId', () => Int) callId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.call.get(context.user, callId);
  }
}
