import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalStatus as ProposalStatusOrigin } from '../../models/ProposalStatus';

@ObjectType()
export class ProposalStatus implements Partial<ProposalStatusOrigin> {
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
}
