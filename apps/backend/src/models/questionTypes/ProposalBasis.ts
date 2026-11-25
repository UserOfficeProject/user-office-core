import {
  DEFAULT_PROPOSAL_ABSTRACT_MAX_LENGTH,
  DEFAULT_PROPOSAL_TITLE_MAX_LENGTH,
} from '@user-office-software/duo-validation';

import { ProposalBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const proposalBasisDefinition: Question<DataType.PROPOSAL_BASIS> = {
  dataType: DataType.PROPOSAL_BASIS,
  createBlankConfig: (): ProposalBasisConfig => {
    const config = new ProposalBasisConfig();
    config.tooltip = '';
    config.maxTitleLength = DEFAULT_PROPOSAL_TITLE_MAX_LENGTH;
    config.maxAbstractLength = DEFAULT_PROPOSAL_ABSTRACT_MAX_LENGTH;

    return config;
  },
  getDefaultAnswer: () => null,
};
