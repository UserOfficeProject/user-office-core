import { Answer } from 'generated/sdk';
import { Event } from 'models/QuestionarySubmissionModel';

export interface BasicComponentProps {
  templateField: Answer;
  touched: any;
  errors: any;
  dispatch: React.Dispatch<Event>;
  onComplete: (evt: React.SyntheticEvent, newValue: any) => void;
}
