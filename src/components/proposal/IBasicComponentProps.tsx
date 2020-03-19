import { QuestionaryField } from '../../generated/sdk';

export interface BasicComponentProps {
  templateField: QuestionaryField;
  touched: any;
  errors: any;
  onComplete: (evt: React.SyntheticEvent, newValue: any) => void;
}
