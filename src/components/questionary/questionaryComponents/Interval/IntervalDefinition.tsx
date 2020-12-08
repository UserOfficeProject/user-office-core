import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createIntervalValidationSchema } from './createIntervalValidationSchema';
import { QuestionaryComponentInterval } from './QuestionaryComponentInterval';
import { QuestionIntervalForm } from './QuestionIntervalForm';
import { QuestionTemplateRelationIntervalForm } from './QuestionTemplateRelationIntervalForm';

export const intervalDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.INTERVAL,
  name: 'Interval',
  questionaryComponent: QuestionaryComponentInterval,
  questionForm: () => QuestionIntervalForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationIntervalForm,
  readonly: false,
  creatable: true,
  icon: <ArrowForwardIosIcon />,
  answerRenderer: ({ answer }) => (
    <span>{`${answer.value.min} - ${answer.value.max} ${answer.value.unit ||
      ''}`}</span>
  ),
  createYupValidationSchema: createIntervalValidationSchema,
  getYupInitialValue: ({ answer }) =>
    answer.value || { min: '', max: '', unit: 'unitless' },
};
