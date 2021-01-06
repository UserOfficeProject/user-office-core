import TodayIcon from '@material-ui/icons/Today';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createDateValidationSchema } from './createDateValidationSchema';
import { QuestionaryComponentDatePicker } from './QuestionaryComponentDatePicker';
import { QuestionDateForm } from './QuestionDateForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateForm';

export const dateDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DATE,
  name: 'Date',
  questionaryComponent: QuestionaryComponentDatePicker,
  questionForm: () => QuestionDateForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationDateForm,
  readonly: false,
  creatable: true,
  icon: <TodayIcon />,
  answerRenderer: ({ answer }) => <span>{answer.value}</span>,
  createYupValidationSchema: createDateValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || '',
};
