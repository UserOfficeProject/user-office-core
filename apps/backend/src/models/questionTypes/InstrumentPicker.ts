/* eslint-disable quotes */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import FapMutations from '../../mutations/FapMutations';
import InstrumentMutations from '../../mutations/InstrumentMutations';
import { InstrumentPickerConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export class InstrumentOptionClass {
  constructor(public id: number, public name: string) {}
}

export const instrumentPickerDefinition: Question<DataType.INSTRUMENT_PICKER> =
  {
    dataType: DataType.INSTRUMENT_PICKER,
    validate: (field: QuestionTemplateRelation, value: string[]) => {
      if (field.question.dataType !== DataType.INSTRUMENT_PICKER) {
        throw new GraphQLError('DataType should be INSTRUMENT_PICKER');
      }

      return new Promise((resolve) => resolve(true));
    },
    createBlankConfig: (): InstrumentPickerConfig => {
      const config = new InstrumentPickerConfig();
      config.small_label = '';
      config.required = false;
      config.tooltip = '';
      config.variant = 'dropdown';
      config.instruments = [];

      return config;
    },
    getDefaultAnswer: () => null,
    filterQuery: (queryBuilder, filter) => {
      const value = JSON.parse(filter.value).value;
      switch (filter.compareOperator) {
        case QuestionFilterCompareOperator.EQUALS:
          return queryBuilder.andWhereRaw("answers.answer->>'value'=?", value);
        default:
          throw new GraphQLError(
            `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
          );
      }
    },
    transformConfig: async (config, callId) => {
      const fallBackConfig = { ...config, instruments: [] };
      try {
        if (!callId) return fallBackConfig;

        const instrumentDataSource = container.resolve<InstrumentDataSource>(
          Tokens.InstrumentDataSource
        );

        const instruments = await instrumentDataSource.getInstrumentsByCallId([
          callId,
        ]);

        return {
          ...config,
          instruments: instruments.map(
            (instrument) =>
              new InstrumentOptionClass(instrument.id, instrument.name)
          ),
        };
      } catch (err) {
        logger.logError('Call Instruments fetch failed', {
          err,
        });
      }

      return fallBackConfig;
    },
    async onBeforeSave(questionaryId, questionTemplateRelation, answer) {
      const proposalDataSource = container.resolve<ProposalDataSource>(
        Tokens.ProposalDataSource
      );
      const instrumentMutations = container.resolve(InstrumentMutations);
      const fapMutation = container.resolve(FapMutations);

      const proposal = await proposalDataSource.getByQuestionaryId(
        questionaryId
      );

      if (!proposal) {
        throw new GraphQLError('Proposal not found');
      }

      const { value } = JSON.parse(answer.value);
      const instrumentId = value;

      // Assign the Proposals to Instrument
      await instrumentMutations.assignProposalsToInstrumentInternal(null, {
        instrumentId,
        proposals: [
          { primaryKey: proposal.primaryKey, callId: proposal.callId },
        ],
      });

      // Assign the Proposals to Fap using Call Instrument
      await fapMutation.assignProposalsToFapUsingCallInstrumentInternal(null, {
        instrumentId: instrumentId,
        proposalPks: [proposal.primaryKey],
      });
    },
  };
