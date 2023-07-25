import {
  Field,
  ObjectType,
  Resolver,
  Query,
  Arg,
  Ctx,
  createUnionType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { AuthJwtApiTokenPayload as AuthJwtApiTokenPayloadBase } from '../../models/User';
import { AuthJwtPayload } from '../types/AuthJwtPayload';

@ObjectType()
class AuthJwtApiTokenPayload implements AuthJwtApiTokenPayloadBase {
  @Field(() => String)
  accessTokenId?: string;
}

const TokenPayloadUnion = createUnionType({
  name: 'TokenPayloadUnion',
  types: () => [AuthJwtPayload, AuthJwtApiTokenPayload] as const,
  resolveType: (value) => {
    if ('user' in value) {
      return AuthJwtPayload;
    }
    if ('accessTokenId' in value) {
      return AuthJwtApiTokenPayload;
    }

    return undefined;
  },
});

@ObjectType()
class TokenResult {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => TokenPayloadUnion, { nullable: true })
  payload?: AuthJwtPayload | AuthJwtApiTokenPayload | null;
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

@ObjectType()
class ExternalTokenResult {
  @Field(() => Boolean)
  isValid: boolean;
}

@Resolver()
export class CheckExternalTokenQuery {
  @Query(() => ExternalTokenResult)
  async checkExternalToken(
    @Ctx() context: ResolverContext,
    @Arg('token') token: string
  ) {
    return { isValid: context.queries.user.checkExternalToken(token) };
  }
}
