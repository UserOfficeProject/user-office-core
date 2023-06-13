/* eslint-disable quotes */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

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
    transformConfig: async (config, helpers, callId) => {
      const fallBackConfig = { ...config, instruments: [] };
      try {
        if (!callId) throw 'Call ID not available. ';
        if (!helpers) throw 'Helpers not available. ';

        const instruments = await helpers.fetchCallInstruments(callId);

        return {
          ...config,
          instruments: instruments.map(
            (instrument) =>
              new InstrumentOptionClass(
                instrument.instrument_id,
                instrument.name
              )
          ),
        };
      } catch (err) {
        logger.logError('Call Instruments fetch failed', {
          err,
        });
      }

      return fallBackConfig;
    },
  };
