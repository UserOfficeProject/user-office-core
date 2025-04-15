import 'reflect-metadata';
import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class Role {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field()
  public title: string;

  @Field()
  public description: string;

  constructor(initObj: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
  }) {
    Object.assign(this, initObj);
  }
}
