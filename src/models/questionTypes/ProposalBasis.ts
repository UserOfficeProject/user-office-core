/* eslint-disable @typescript-eslint/camelcase */
import { ProposalBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const proposalBasisDefinition: Question = {
  dataType: DataType.PROPOSAL_BASIS,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.PROPOSAL_BASIS) {
      throw new Error('DataType should be PROPOSAL_BASIS');
    }

    return true;
  },
  createBlankConfig: (): ProposalBasisConfig => {
    const config = new ProposalBasisConfig();
    config.tooltip = '';

    return config;
  },
  isReadOnly: true,
  defaultAnswer: null,
};
