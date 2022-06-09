import { ObjectType, Field } from 'type-graphql';

import { TemplateValidationData as TemplateValidationDataOrigin } from '../../models/Template';
import { QuestionComparison } from './QuestionComparison';

@ObjectType()
export class TemplateValidationData
  implements Partial<TemplateValidationDataOrigin>
{
  @Field(() => Boolean)
  public isValid: boolean;

  @Field(() => [String])
  public errors: string[];

  @Field(() => [QuestionComparison])
  public questionComparisons: QuestionComparison[];

  @Field(() => [TemplateValidationData])
  public subTemplateValidationData: TemplateValidationData[];
}
