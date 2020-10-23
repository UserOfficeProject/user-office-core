import { Field, ObjectType, Resolver, Query, Arg, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { AuthJwtPayload as AuthJwtPayloadBase } from '../../models/User';
import { Role } from '../types/Role';
import { User } from '../types/User';

@ObjectType()
class AuthJwtPayload implements AuthJwtPayloadBase {
  @Field(() => User)
  user: User;

  @Field(() => Role)
  currentRole: Role;

  @Field(() => [Role])
  roles: Role[];
}

@ObjectType()
class TokenResult {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => AuthJwtPayload, { nullable: true })
  payload: AuthJwtPayload | null;
}

@Resolver()
export class TokenQuery {
  @Query(() => TokenResult)
  async checkToken(
    @Ctx() ctx: ResolverContext,
    @Arg('token', () => String) token: string
  ) {
    const result = new TokenResult();
    const { isValid, payload } = await ctx.queries.user.checkToken(token);

    result.isValid = isValid;
    result.payload = payload;

    return result;
  }
}
