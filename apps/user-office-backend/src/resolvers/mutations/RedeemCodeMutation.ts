import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { RedeemCode } from '../types/RedeemCode';

@Resolver()
export class RedeemCodeMutation {
  @Mutation(() => RedeemCode)
  redeemCode(
    @Arg('code', () => String) code: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.redeemCodes.redeemCode(context.user, code);
  }
}
