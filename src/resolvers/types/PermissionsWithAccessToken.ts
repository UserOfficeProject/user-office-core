import { ObjectType, Field } from 'type-graphql';

import { Permissions } from '../../models/Permissions';

@ObjectType()
export class PermissionsWithAccessToken implements Partial<Permissions> {
  @Field()
  public id: string;

  @Field()
  public name: string;

  @Field()
  public accessToken: string;

  @Field()
  public accessPermissions: string;
}
