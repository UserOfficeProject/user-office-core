import { ObjectType, Field } from 'type-graphql';

import { AuthJwtPayload as AuthJwtPayloadBase } from '../../models/User';
import { Role } from './Role';
import { UserJWT } from './UserJWT';

@ObjectType()
export class AuthJwtPayload implements AuthJwtPayloadBase {
  @Field(() => UserJWT)
  user: UserJWT;

  @Field(() => Role)
  currentRole: Role;

  @Field(() => [Role])
  roles: Role[];
}
