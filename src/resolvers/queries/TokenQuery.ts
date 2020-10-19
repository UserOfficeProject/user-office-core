import { Field, ObjectType, Resolver, Query, Arg, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
class TokenResult {
  @Field(() => Boolean)
  isValid: boolean;
}

@Resolver()
export class TokenQuery {
  @Query(() => TokenResult)
  async checkToken(
    @Ctx() ctx: ResolverContext,
    @Arg('token', () => String) token: string
  ) {
    const result = new TokenResult();
    result.isValid = await ctx.queries.user.checkToken(token);

    return result;
  }
}
