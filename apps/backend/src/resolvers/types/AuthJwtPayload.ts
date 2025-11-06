import { ObjectType, Field } from 'type-graphql';

import { Role } from './Role';
import { UserJWT } from './UserJWT';
import { AuthJwtPayload as AuthJwtPayloadBase } from '../../models/User';

@ObjectType()
export class AuthJwtPayload implements AuthJwtPayloadBase {
  @Field(() => UserJWT)
  user: UserJWT;

  @Field(() => Role)
  currentRole: Role;

  @Field(() => [Role])
  roles: Role[];
}
