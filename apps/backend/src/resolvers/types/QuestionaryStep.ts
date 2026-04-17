import { ObjectType, Field } from 'type-graphql';

import { Answer } from './Answer';
import { Topic } from './Topic';
import { QuestionaryStep as QuestionaryStepOrigin } from '../../models/Questionary';

@ObjectType()
export class QuestionaryStep implements Partial<QuestionaryStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field()
  public isCompleted: boolean;

  @Field(() => [Answer])
  public fields: Answer[];
}
