import { Field, ObjectType } from "type-graphql";
import { Proposal } from "../../models/Proposal";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
export class ProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field({ nullable: true })
  public proposal: Proposal;

  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

export const proposalWrap = wrapResponse<Proposal>(new ProposalResponseWrap());
