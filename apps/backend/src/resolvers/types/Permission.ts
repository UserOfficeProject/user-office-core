import { ObjectType, Field, Int } from 'type-graphql';

import { Permission as PermissionOrigin } from '../../models/Permission';

@ObjectType()
export class Permission implements Partial<PermissionOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public role: string;

  @Field()
  public object: string;

  @Field()
  public action: string;

  @Field()
  public call: string;

  @Field(() => [String])
  public instrument_ids: string[];

  @Field()
  public facility: string;

  @Field()
  public instrument_operator: string;

  @Field()
  public custom_filter: string;
}
