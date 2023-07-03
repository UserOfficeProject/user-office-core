import { sampleDeclarationValidationSchema } from '@user-office-software/duo-validation';
import { GraphQLError } from 'graphql';

import {
  DataType,
  QuestionTemplateRelation,
  TemplateCategoryId,
} from '../Template';
import { SampleDeclarationConfig } from './../../resolvers/types/FieldConfig';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question<DataType.SAMPLE_DECLARATION> =
  {
    dataType: DataType.SAMPLE_DECLARATION,
    createBlankConfig: (): SampleDeclarationConfig => {
      const config = new SampleDeclarationConfig();
      config.addEntryButtonLabel = 'Add';
      config.templateCategory =
        TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
      config.templateId = null;
      config.esiTemplateId = null;
      config.small_label = '';
      config.required = false;

      return config;
    },
    getDefaultAnswer: () => [],
    validate: (field: QuestionTemplateRelation, value: any) => {
      if (field.question.dataType !== DataType.SAMPLE_DECLARATION) {
        throw new GraphQLError('DataType should be SAMPLE_DECLARATION');
      }

      return sampleDeclarationValidationSchema(field).isValid(value);
    },
  };
