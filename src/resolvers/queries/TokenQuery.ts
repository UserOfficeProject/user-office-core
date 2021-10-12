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
import {
  AuthJwtPayload as AuthJwtPayloadBase,
  AuthJwtApiTokenPayload as AuthJwtApiTokenPayloadBase,
} from '../../models/User';
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
