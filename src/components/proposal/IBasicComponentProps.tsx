import { Answer } from 'generated/sdk';

export interface BasicComponentProps {
  templateField: Answer;
  touched: any;
  errors: any;
  onComplete: (evt: React.SyntheticEvent, newValue: any) => void;
}
