import 'reflect-metadata';
import { Field, ObjectType, Int } from 'type-graphql';

import { Role as RoleOrigin } from '../../models/Role';

@ObjectType()
export class Role implements Partial<RoleOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field()
  public title: string;

  @Field()
  public description: string;

  @Field(() => [String])
  public dataAccess: string[];

  @Field(() => [String])
  public permissions: string[];

  constructor(initObj: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    dataAccess: string[];
    permissions: string[];
  }) {
    Object.assign(this, initObj);
  }
}
