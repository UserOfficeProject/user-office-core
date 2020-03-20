import { ObjectType, Field } from 'type-graphql';

import { QuestionaryStep as QuestionaryStepOrigin } from '../../models/ProposalModel';
import { QuestionaryField } from './QuestionaryField';
import { Topic } from './Topic';

@ObjectType()
export class QuestionaryStep implements Partial<QuestionaryStepOrigin> {
  @Field(() => Topic)
  public topic: Topic;
  @Field()
  public isCompleted: boolean;
  @Field(() => QuestionaryField)
  public fields: QuestionaryField[];
}
