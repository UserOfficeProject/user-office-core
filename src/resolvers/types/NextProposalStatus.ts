import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class NextProposalStatus {
  @Field(() => Int, { nullable: true })
  public proposalNextStatusId: number;

  @Field(() => String, { nullable: true })
  public proposalNextStatusShortCode: string;

  @Field(() => String, { nullable: true })
  public proposalNextStatusName: string;
}
