import { logger } from '@user-office-software/duo-logger';
/* eslint-disable quotes */
import { numberInputQuestionValidationSchema } from '@user-office-software/duo-validation';

import {
  NumberInputConfig,
  NumberValueConstraint,
} from '../../resolvers/types/FieldConfig';
import { isSiConversionFormulaValid } from '../../utils/isSiConversionFormulaValid';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Unit } from '../Unit';
import { Question } from './QuestionRegistry';

export const numberInputDefinition: Question = {
  dataType: DataType.NUMBER_INPUT,
  getDefaultAnswer: (field) => {
    return {
      value: '',
      unit: (field.config as NumberInputConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { value: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.NUMBER_INPUT) {
      throw new Error('DataType should be NUMBER_INPUT');
    }

    return numberInputQuestionValidationSchema(
      field,
      NumberValueConstraint
    ).isValid(value);
  },
  createBlankConfig: (): NumberInputConfig => {
    const config = new NumberInputConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.units = [];

    return config;
  },
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.LESS_THAN:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'siValue')::float < ?",
          value
        );
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'siValue')::float = ?",
          value
        );
      case QuestionFilterCompareOperator.GREATER_THAN:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'siValue')::float > ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for NumberInput ${filter.compareOperator}`
        );
    }
  },
  transform: (
    field: QuestionTemplateRelation,
    answer: { value: number; unit: Unit | null }
  ) => {
    const { unit } = answer;

    if (unit && unit.siConversionFormula) {
      const isValid = isSiConversionFormulaValid(unit.siConversionFormula);
      if (isValid === false) {
        logger.logError('Conversion formula is not valid', answer);
        throw new Error('Error while processing conversion formula');
      }
    }

    return answer;
  },
};
