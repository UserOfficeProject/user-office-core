import { Field, ObjectType } from "type-graphql";
import { ProposalTemplate } from "../../models/ProposalModel";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

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
