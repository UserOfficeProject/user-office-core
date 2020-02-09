import { QuestionaryField } from "../generated/sdk";

export interface IBasicComponentProps {
  templateField: QuestionaryField;
  touched: any;
  errors: any;
  handleChange: any;
}
