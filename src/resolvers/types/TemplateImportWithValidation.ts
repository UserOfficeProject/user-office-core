import { ObjectType, Field } from 'type-graphql';

import { TemplateImportWithValidation as TemplateImportWithValidationOrigin } from '../../models/Template';
import { QuestionComparison } from './QuestionComparison';

@ObjectType()
export class TemplateImportWithValidation
  implements Partial<TemplateImportWithValidationOrigin>
{
  @Field(() => String)
  public json: string;

  @Field(() => String)
  public version: string;

  @Field(() => Date)
  public exportDate: Date;

  @Field(() => Boolean)
  public isValid: boolean;

  @Field(() => [String])
  public errors: string[];

  @Field(() => [QuestionComparison])
  public questionComparisons: QuestionComparison[];
}
