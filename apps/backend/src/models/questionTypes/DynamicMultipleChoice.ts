/* eslint-disable quotes */

import { logger } from '@user-office-software/duo-logger';
import axios, { AxiosRequestHeaders } from 'axios';
import jp from 'jsonpath';

import { DynamicMultipleChoiceConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dynamicMultipleChoiceDefinition: Question<DataType.DYNAMIC_MULTIPLE_CHOICE> =
  {
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
      config.apiCallRequestHeaders = [];
      config.externalApiCall = true;

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
    transformConfig: async (config) => {
      const fallBackConfig = { ...config, options: [] };

      try {
        const resp = await axios.get(config.url, {
          headers: config.apiCallRequestHeaders.reduce(
            (acc, header) => ({
              ...acc,
              [header.name]: header.value,
            }),
            {} as AxiosRequestHeaders
          ),
        });

        if (
          Array.isArray(resp.data) &&
          resp.data.every((el) => typeof el === 'string')
        ) {
          return { ...config, options: resp.data };
        } else {
          const jsonPathFilteredData = jp.query(resp.data, config.jsonPath);

          return { ...config, options: jsonPathFilteredData };
        }
      } catch (err) {
        logger.logError('Dynamic multiple choice external api fetch failed', {
          err,
        });
      }

      return fallBackConfig;
    },
  };
