import { ProposalStatus } from "./ProposalModel";
import { ObjectType, Field, Int } from "type-graphql";
@ObjectType()
export class Proposal {
  @Field(() => Int, { nullable: true })
  public id: number;

  @Field(() => String, { nullable: true })
  public title: string;

  @Field(() => String, { nullable: true })
  public abstract: string;

  @Field(() => ProposalStatus)
  public status: ProposalStatus;

  @Field(() => Date, { nullable: true })
  public created: Date;

  @Field(() => Date, { nullable: true })
  public updated: Date;

  @Field(() => String, { nullable: true })
  public shortCode: string;

  public proposerId: number;

  constructor(
    id: number,
    title: string,
    abstract: string,
    proposerId: number,
    status: ProposalStatus,
    created: Date,
    updated: Date,
    shortCode: string
  ) {
    this.id = id;
    this.title = title;
    this.abstract = abstract;
    this.proposerId = proposerId;
    this.status = status;
    this.created = created;
    this.updated = updated;
    this.shortCode = shortCode;
  }
}
