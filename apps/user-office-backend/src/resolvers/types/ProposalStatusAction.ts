import { Field, Int, ObjectType } from 'type-graphql';

import {
  ProposalStatusAction as ProposalStatusActionOrigin,
  ProposalStatusActionType,
} from '../../models/ProposalStatusAction';

@ObjectType()
export class ProposalStatusAction
  implements Partial<ProposalStatusActionOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => String)
  public defaultConfig: string;

  @Field(() => ProposalStatusActionType)
  public type: ProposalStatusActionType;
}
