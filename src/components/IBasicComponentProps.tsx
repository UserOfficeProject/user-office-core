import { QuestionaryField } from "../models/ProposalModel";
export interface IBasicComponentProps {
  templateField: QuestionaryField;
  onComplete: Function;
  touched: any;
  errors: any;
  handleChange: any;
}
