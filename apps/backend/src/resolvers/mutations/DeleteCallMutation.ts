import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call } from '../types/Call';

@Resolver()
export class DeleteCallMutation {
  @Mutation(() => Call)
  deleteCall(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.delete(context.user, { callId: id });
  }
}
