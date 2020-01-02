import { Field, Int, ObjectType } from "type-graphql";
import { Proposal } from "../models/Proposal";
import { ProposalTemplate } from "../models/ProposalModel";
import { BasicUserDetails } from "../models/User";
import { AbstractResponseWrap, wrapResponse } from "./Utils";

@ObjectType()
export class BasicUserDetailsResponseWrap extends AbstractResponseWrap<
  BasicUserDetails
> {
  @Field({ nullable: true })
  public user: BasicUserDetails;

  setValue(value: BasicUserDetails): void {
    this.user = value;
  }
}

export const wrapBasicUserDetails = wrapResponse<BasicUserDetails>(
  new BasicUserDetailsResponseWrap()
);

@ObjectType()
export class IntIdWrapper extends AbstractResponseWrap<number> {
  @Field(() => Int, { nullable: true })
  public id: number;

  setValue(value: number): void {
    this.id = value;
  }
}

export const wrapIntId = wrapResponse<number>(new IntIdWrapper());

@ObjectType()
export class ProposalTemplateResponseWrap extends AbstractResponseWrap<
  ProposalTemplate
> {
  @Field({ nullable: true })
  public template: ProposalTemplate;

  setValue(value: ProposalTemplate): void {
    this.template = value;
  }
}

export const wrapTemplate = wrapResponse<ProposalTemplate>(
  new ProposalTemplateResponseWrap()
);

@ObjectType()
export class ProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field({ nullable: true })
  public proposal: Proposal;

  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

export const proposalWrap = wrapResponse<Proposal>(new ProposalResponseWrap());
