import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return context.queries.user.get(context.user, id);
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: ResolverContext) {
    return context.queries.user.me(context.user);
  }

  @Query(() => Boolean, { nullable: true })
  async instrumentScientistHasAccess(
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Arg('proposalId', () => Int) proposalId: number,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.user.hasInstrumentScientistAccess(
      context.user,
      instrumentId,
      proposalId
    );
  }
}
