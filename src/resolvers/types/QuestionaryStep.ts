import { ObjectType, Field } from "type-graphql";

import { QuestionaryStep as QuestionaryStepOrigin } from "../../models/ProposalModel";
import { Topic } from "./Topic";
import { QuestionaryField } from "./QuestionaryField";

@ObjectType()
export class QuestionaryStep implements Partial<QuestionaryStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;
  @Field()
  public isCompleted: boolean;
  @Field(() => QuestionaryField)
  public fields: QuestionaryField[];
}
