/* eslint-disable @typescript-eslint/camelcase */
import { ProposalBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const proposalBasisDefinition: Question = {
  dataType: DataType.PROPOSAL_BASIS,
  createBlankConfig: (): ProposalBasisConfig => {
    const config = new ProposalBasisConfig();
    config.tooltip = '';

    return config;
  },
  isReadOnly: true,
  getDefaultAnswer: () => null,
};
