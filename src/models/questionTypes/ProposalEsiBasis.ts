import {
  ProposalBasisConfig,
  ProposalEsiBasisConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const proposalEsiBasisDefinition: Question = {
  dataType: DataType.PROPOSAL_ESI_BASIS,
  createBlankConfig: (): ProposalEsiBasisConfig => {
    const config = new ProposalBasisConfig();
    config.tooltip = '';

    return config;
  },
  getDefaultAnswer: () => null,
};
