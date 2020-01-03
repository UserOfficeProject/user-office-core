import { Field, ObjectType } from "type-graphql";
import { QuestionaryField as QuestionaryFieldOrigin } from "../../models/ProposalModel";
import { ProposalTemplateField } from "./ProposalTemplateField";

@ObjectType()
export class QuestionaryField extends ProposalTemplateField
  implements Partial<QuestionaryFieldOrigin> {
  @Field(() => String)
  public value: any;
}
