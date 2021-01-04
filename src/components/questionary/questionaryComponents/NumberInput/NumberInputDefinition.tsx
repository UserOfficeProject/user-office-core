import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createNumberInputValidationSchema } from './createNumberInputValidationSchema';
import { QuestionaryComponentInterval } from './QuestionaryComponentNumberInput';
import { QuestionIntervalForm } from './QuestionNumberInputForm';
import { QuestionTemplateRelationIntervalForm } from './QuestionTemplateRelationNumberInputForm';

export const numberInputDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.NUMBER_INPUT,
  name: 'Number',
  questionaryComponent: QuestionaryComponentInterval,
  questionForm: () => QuestionIntervalForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationIntervalForm,
  readonly: false,
  creatable: true,
  icon: <ExposureZeroIcon />,
  answerRenderer: ({ answer }) =>
    answer.value.value !== null ? (
      <span>{`${answer.value.value} ${answer.value.unit || ''}`}</span>
    ) : null,
  createYupValidationSchema: createNumberInputValidationSchema,
  getYupInitialValue: ({ answer }) =>
    answer.value || { value: '', unit: 'unitless' },
};
