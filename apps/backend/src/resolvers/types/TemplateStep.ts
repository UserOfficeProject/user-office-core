import { ObjectType, Field } from 'type-graphql';

import { QuestionTemplateRelation } from './QuestionTemplateRelation';
import { Topic } from './Topic';
import { TemplateStep as TemplateStepOrigin } from '../../models/Template';

@ObjectType()
export class TemplateStep implements Partial<TemplateStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field(() => [QuestionTemplateRelation])
  public fields: QuestionTemplateRelation[];
}
