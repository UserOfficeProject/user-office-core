/* eslint-disable quotes */

import { logger } from '@user-office-software/duo-logger';
import axios from 'axios';
import jp from 'jsonpath';

import {
  QuestionRecord,
  QuestionTemplateRelRecord,
} from '../../datasources/postgres/records';
import { DynamicMultipleChoiceConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export type DynamicRecord = QuestionRecord &
  QuestionTemplateRelRecord & { value: any; answer_id: number } & {
    dependency_natural_key: string;
  };

export const dynamicMultipleChoiceDefinition: Question = {
  dataType: DataType.DYNAMIC_MULTIPLE_CHOICE,
  validate: async (field: QuestionTemplateRelation) => {
    if (field.question.dataType !== DataType.DYNAMIC_MULTIPLE_CHOICE) {
      throw new Error('DataType should be DYNAMIC_MULTIPLE_CHOICE');
    }
    /*
    NOTE: Since we are getting options from an api call response,
    It's hard to make a validation schema to validate whether pre & post values are identical.
    When we create a question using dynamic multi choice, we copy paste API url in the input field.
    Where we use the question, however, we use values returned from the API reponse.
    */

    return true;
  },
  createBlankConfig: (): DynamicMultipleChoiceConfig => {
    const config = new DynamicMultipleChoiceConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';
    config.variant = 'radio';
    config.url = '';
    config.options = [];
    config.jsonPath = '';
    config.isMultipleSelect = false;
    config.token = '';

    return config;
  },
  getDefaultAnswer: () => [],
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.INCLUDES:
        /* 
        "\\?" is escaping question mark for JSONB lookup 
        (read more here https://www.postgresql.org/docs/9.5/functions-json.html),  
        but "?" is used for binding 
        */
        return queryBuilder.andWhereRaw(
          "(answers.answer->>'value')::jsonb \\? ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
        );
    }
  },
  externalApiCall: async (record: any) => {
    let recordWithApiCall;

    try {
      const resp = await axios.get(record.config.url, {
        headers: {
          Authorization: `Bearer ${record.config.token}`,
        },
      });
      const arrayData =
        Array.isArray(resp.data) &&
        resp.data.every((el) => typeof el === 'string');
      if (arrayData) {
        recordWithApiCall = {
          ...record,
          config: {
            ...record.config,
            options: resp.data,
          },
        };
      } else {
        try {
          const jsonPathFilteredData = jp.query(
            resp.data,
            record.config.jsonPath
          );

          recordWithApiCall = {
            ...record,
            config: {
              ...record.config,
              options: jsonPathFilteredData,
            },
          };
        } catch (err) {
          logger.logError('Jsonpath query failed: ', {
            err,
          });
          recordWithApiCall = {
            ...record,
            config: {
              ...record.config,
              options: [],
            },
          };
        }
      }
    } catch (err) {
      logger.logError('Dynamic multiple choice external api fetch failed', {
        err,
      });
      recordWithApiCall = {
        ...record,
        config: {
          ...record.config,
          options: [],
        },
      };
    }

    return recordWithApiCall as DynamicRecord;
  },
};
