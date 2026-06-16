import { ObjectType, Field } from 'type-graphql';

import { Role } from './Role';
import { UserJWT } from './UserJWT';

@ObjectType()
export class AuthJwtPayload {
  @Field(() => UserJWT)
  user: UserJWT;

  @Field(() => Role)
  currentRole: Role;

  @Field(() => [Role])
  roles: Role[];
}
