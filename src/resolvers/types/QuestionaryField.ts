import { Field, ObjectType } from 'type-graphql';

import { QuestionaryField as QuestionaryFieldOrigin } from '../../models/ProposalModel';
import { IntStringDateBool } from '../CustomScalars';
import { ProposalTemplateField } from './ProposalTemplateField';

@ObjectType()
export class QuestionaryField extends ProposalTemplateField
  implements Partial<QuestionaryFieldOrigin> {
  @Field(() => IntStringDateBool)
  public value: number | string | Date | boolean;
}
