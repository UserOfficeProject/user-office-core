import { ObjectType, Field, Int } from 'type-graphql';

import { Topic as TopicOrigin } from '../../models/ProposalModel';
@ObjectType()
export class Topic implements Partial<TopicOrigin> {
  @Field(type => Int)
  public topic_id: number; // TODO fix casing. Use CamelCasing

  @Field()
  public topic_title: string;

  @Field(type => Int)
  public sort_order: number;

  @Field()
  public is_enabled: boolean;
}
