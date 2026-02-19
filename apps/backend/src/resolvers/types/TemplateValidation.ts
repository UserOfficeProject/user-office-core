import { ObjectType, Field } from 'type-graphql';

import { TemplateValidationData } from './TemplateValidationData';
import { TemplateValidation as TemplateValidationOrigin } from '../../models/Template';

@ObjectType()
export class TemplateValidation implements Partial<TemplateValidationOrigin> {
  @Field(() => String)
  public json: string;

  @Field(() => String)
  public version: string;

  @Field(() => Date)
  public exportDate: Date;

  @Field(() => TemplateValidationData)
  public validationData: TemplateValidationData;
}
