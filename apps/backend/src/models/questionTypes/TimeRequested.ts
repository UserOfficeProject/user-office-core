import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import ProposalMutations from '../../mutations/ProposalMutations';
import { TimeRequestedConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const timeRequestedDefinition: Question<DataType.TIME_REQUESTED> = {
  dataType: DataType.TIME_REQUESTED,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.TIME_REQUESTED) {
      throw new GraphQLError('DataType should be TIME_REQUESTED');
    }

    return new Promise((resolve) => resolve(true));
  },

  createBlankConfig: (): TimeRequestedConfig => {
    const config = new TimeRequestedConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.time = '';

    return config;
  },
  getDefaultAnswer: () => '',
  async onBeforeSave(questionaryId, questionTemplateRelation, answer) {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const proposalMutations = container.resolve(ProposalMutations);
    const proposal = await proposalDataSource.getByQuestionaryId(questionaryId);

    if (!proposal) {
      throw new GraphQLError('Proposal not found');
    }
    const { value } = JSON.parse(answer.value);
    logger.logInfo(`${value} time from the frontend`, {});
    proposalMutations.updateProposalTimeRequested(proposal.primaryKey, value);
  },
};
