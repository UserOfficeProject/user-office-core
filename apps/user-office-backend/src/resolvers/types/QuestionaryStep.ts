import { ObjectType, Field } from 'type-graphql';

import { QuestionaryStep as QuestionaryStepOrigin } from '../../models/Questionary';
import { Answer } from './Answer';
import { Topic } from './Topic';

@ObjectType()
export class QuestionaryStep implements Partial<QuestionaryStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;

  @Field()
  public isCompleted: boolean;

  @Field(() => [Answer])
  public fields: Answer[];
}
