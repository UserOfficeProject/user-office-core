import { FunctionComponent } from 'react';

import { Template } from '../../../generated/sdk';
import { Event } from '../../../models/QuestionaryEditorModel';

interface FormProps<ValueObjectType> {
  field: ValueObjectType;
  template: Template;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
}

export type TFormSignature<ValueObjectType> = FunctionComponent<
  FormProps<ValueObjectType>
>;
