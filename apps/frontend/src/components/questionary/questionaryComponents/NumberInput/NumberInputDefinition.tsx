import NumberOneIcon from '@mui/icons-material/LooksOneOutlined';
import { numberInputQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import {
  DataType,
  NumberInputConfig,
  NumberValueConstraint,
} from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import NumberInputAnswerRenderer from './NumberInputAnswerRenderer';
import NumberSearchCriteriaComponent from './NumberSearchCriteriaComponent';
import { QuestionaryComponentNumber } from './QuestionaryComponentNumberInput';
import { QuestionNumberForm } from './QuestionNumberInputForm';
import { QuestionTemplateRelationNumberForm } from './QuestionTemplateRelationNumberInputForm';

export const numberInputDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.NUMBER_INPUT,
  name: 'Number',
  questionaryComponent: QuestionaryComponentNumber,
  questionForm: () => QuestionNumberForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationNumberForm,
  readonly: false,
  creatable: true,
  icon: <NumberOneIcon />,
  renderers: {
    answerRenderer: NumberInputAnswerRenderer,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: (field) =>
    numberInputQuestionValidationSchema(field, NumberValueConstraint),
  getYupInitialValue: ({ answer }) =>
    answer.value || {
      value: '',
      unit: (answer.config as NumberInputConfig).units?.[0] || null,
    },
  searchCriteriaComponent: NumberSearchCriteriaComponent,
};
