import { ObjectType, Field } from 'type-graphql';

import { TemplateStep as TemplateStepOrigin } from '../../models/ProposalModel';
import { QuestionRel } from './QuestionRel';
import { Topic } from './Topic';

@ObjectType()
export class TemplateStep implements Partial<TemplateStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field(() => [QuestionRel])
  public fields: QuestionRel[];
}
