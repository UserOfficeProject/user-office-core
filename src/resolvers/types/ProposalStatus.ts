import { ObjectType, Field, Int } from 'type-graphql';

import { ProposalStatus as ProposalStatusOrigin } from '../../models/ProposalStatus';

@ObjectType()
export class ProposalStatus implements Partial<ProposalStatusOrigin> {
  @Field(() => Int, { nullable: true })
  public id: number;

  @Field(() => String, { nullable: true })
  public shortCode: string;

  @Field(() => String, { nullable: true })
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field(() => Boolean, { nullable: true })
  public isDefault: boolean;
}
