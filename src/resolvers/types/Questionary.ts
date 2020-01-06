import { ObjectType, Field } from "type-graphql";

import { Questionary as QuestionaryOrigin } from "../../models/ProposalModel";
import { QuestionaryStep } from "./QuestionaryStep";

@ObjectType()
export class Questionary implements Partial<QuestionaryOrigin> {
  @Field(() => [QuestionaryStep])
  public steps: QuestionaryStep[];
}
