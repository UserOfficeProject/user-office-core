/* eslint-disable quotes */

import { logger } from '@user-office-software/duo-logger';
import { intervalQuestionValidationSchema } from '@user-office-software/duo-validation';

import { IntervalConfig } from '../../resolvers/types/FieldConfig';
import { isSiConversionFormulaValid } from '../../utils/isSiConversionFormulaValid';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Unit } from '../Unit';
import { Question } from './QuestionRegistry';

export const intervalDefinition: Question = {
  dataType: DataType.INTERVAL,
  getDefaultAnswer: (field) => {
    return {
      min: '',
      max: '',
      unit: (field.config as IntervalConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { min: number; max: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.INTERVAL) {
      throw new Error('DataType should be INTERVAL');
    }

    return intervalQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): IntervalConfig => {
    const config = new IntervalConfig();
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
          "(answers.answer->'value'->>'siMax')::float < ?",
          value
        );
      case QuestionFilterCompareOperator.GREATER_THAN:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'siMin')::float > ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for Interval ${filter.compareOperator}`
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
