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

  @Query(() => Call, { nullable: true })
  callByQuestionId(
    @Arg('questionId', () => String) questionId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.call.getCallByQuestionId(context.user, questionId);
  }
}
