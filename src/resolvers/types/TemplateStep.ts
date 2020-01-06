import { ObjectType, Field } from "type-graphql";

import { TemplateStep as TemplateStepOrigin } from "../../models/ProposalModel";
import { ProposalTemplateField } from "./ProposalTemplateField";
import { Topic } from "./Topic";

@ObjectType()
export class TemplateStep implements Partial<TemplateStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field(() => [ProposalTemplateField])
  public fields: ProposalTemplateField[];
}
