import { ObjectType, Field, Int } from 'type-graphql';

import { Topic as TopicOrigin } from '../../models/Template';
@ObjectType()
export class Topic implements Partial<TopicOrigin> {
  @Field(type => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(type => Int)
  public sortOrder: number;

  @Field()
  public isEnabled: boolean;
}
