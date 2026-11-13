import { ObjectType, Field, Int } from 'type-graphql';

import { Page as PageOrigin } from '../../models/Admin';

@ObjectType()
export class Page implements Partial<PageOrigin> {
  @Field(() => Int)
  public pagetextId: number;

  @Field(() => Int)
  public pageId: number;

  @Field(() => Int)
  public roleId: number;

  @Field(() => String)
  public content: string;
}
