import { ObjectType, Field, Int } from 'type-graphql';

import { Status as StatusOrigin } from '../../models/ProposalStatus';

@ObjectType()
export class Status implements Partial<StatusOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => Boolean)
  public isDefault: boolean;

  @Field(() => String)
  public entityType: 'proposal' | 'experiment';
}
