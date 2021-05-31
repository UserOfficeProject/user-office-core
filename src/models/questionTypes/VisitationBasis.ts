import { DataType } from '../Template';
import { VisitationBasisConfig } from './../../resolvers/types/FieldConfig';
import { Question } from './QuestionRegistry';

export const visitationBasisDefinition: Question = {
  dataType: DataType.VISITATION_BASIS,
  createBlankConfig: (): VisitationBasisConfig => {
    return new VisitationBasisConfig();
  },
  getDefaultAnswer: () => null,
};
