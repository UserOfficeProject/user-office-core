import { ProposalTemplate } from '../../../generated/sdk';
import { FunctionComponent } from 'react';
import { Event } from '../../../models/QuestionaryEditorModel';

interface FormProps<ValueObjectType> {
  field: ValueObjectType;
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
}

export type TFormSignature<ValueObjectType> = FunctionComponent<
  FormProps<ValueObjectType>
>;
