import { ObjectType, Field, Int } from 'type-graphql';

import { Page as PageOrigin } from '../../models/Admin';

@ObjectType()
export class Page implements Partial<PageOrigin> {
  @Field(() => Int)
  public id: number;

  @Field({ nullable: true })
  public content: string;
}
