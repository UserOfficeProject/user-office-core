import { ObjectType, Field } from 'type-graphql';

import { TemplateValidation as TemplateValidationOrigin } from '../../models/Template';
import { TemplateValidationData } from './TemplateValidationData';

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
