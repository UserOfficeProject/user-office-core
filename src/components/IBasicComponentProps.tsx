import { QuestionaryField } from "../generated/sdk";

export interface IBasicComponentProps {
  templateField: QuestionaryField;
  onComplete: Function;
  touched: any;
  errors: any;
  handleChange: any;
}
