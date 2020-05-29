import { ObjectType, Field, Int } from 'type-graphql';

import { Topic as TopicOrigin } from '../../models/ProposalModel';
@ObjectType()
export class Topic implements Partial<TopicOrigin> {
  @Field(type => Int)
  public id: number; // TODO fix casing. Use CamelCasing

  @Field()
  public title: string;

  @Field(type => Int)
  public sortOrder: number;

  @Field()
  public isEnabled: boolean;
}
