import { Answer } from 'generated/sdk';

export interface BasicComponentProps {
  answer: Answer;
  touched: any;
  errors: any;
  onComplete: (evt: React.ChangeEvent<any>, newValue: any) => void;
}
