import { ObjectType, Field } from "type-graphql";

import { ProposalTemplate as ProposalTemplateOrigin } from "../../models/ProposalModel";
import { TemplateStep } from "./TemplateStep";

@ObjectType()
export class ProposalTemplate implements Partial<ProposalTemplateOrigin> {
  @Field(type => TemplateStep)
  public steps: TemplateStep[] = [];
}
