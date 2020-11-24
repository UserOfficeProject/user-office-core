import { ObjectType, Field, Int } from 'type-graphql';

import { Topic as TopicOrigin } from '../../models/Template';
@ObjectType()
export class Topic implements Partial<TopicOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field()
  public isEnabled: boolean;
}
