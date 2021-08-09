import { RiskAssessmentBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const riskAssessmentBasisDefinition: Question = {
  dataType: DataType.RISK_ASSESSMENT_BASIS,
  createBlankConfig: (): RiskAssessmentBasisConfig => {
    return new RiskAssessmentBasisConfig();
  },
  getDefaultAnswer: () => null,
};
