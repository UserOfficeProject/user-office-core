import { ObjectType, Field } from 'type-graphql';

import { TemplateStep as TemplateStepOrigin } from '../../models/Template';
import { QuestionTemplateRelation } from './QuestionTemplateRelation';
import { Topic } from './Topic';

@ObjectType()
export class TemplateStep implements Partial<TemplateStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field(() => [QuestionTemplateRelation])
  public fields: QuestionTemplateRelation[];
}
