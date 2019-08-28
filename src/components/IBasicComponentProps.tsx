import { ProposalTemplateField } from "../model/ProposalModel";
export interface IBasicComponentProps {
  templateField: ProposalTemplateField;
  onComplete: Function;
  touched: any;
  errors: any;
  handleChange: any;
}
